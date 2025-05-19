import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsIn,
  Matches,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class EmailDomainValidator implements ValidatorConstraintInterface {
  validate(email: string) {
    const allowed = ['gmail.com', 'naver.com', 'daum.net'];
    // 차단할 임시/가짜 메일 도메인 리스트
    const banned = [
      'test.com',
      'example.com',
      'tempmail.com',
      'mailinator.com',
      '10minutemail.com',
      'guerrillamail.com',
      'yopmail.com',
    ];
    const parts = email.split('@');
    return (
      parts.length === 2 &&
      allowed.includes(parts[1]) &&
      !banned.includes(parts[1])
    );
  }
  defaultMessage() {
    return 'gmail.com, naver.com, daum.net 메일만 가입 가능하며, 임시/가짜 메일은 허용되지 않습니다.';
  }
}

export class RegisterDto {
  @IsString()
  @Matches(/^[가-힣a-zA-Z]{2,20}$/, {
    message:
      '이름은 한글 또는 영문만 2~20자, 띄어쓰기/숫자/특수문자 불가입니다.',
  })
  name: string;

  @IsString()
  @Matches(/^01[016789][0-9]{7,8}$/, { message: '잘못된 전화번호 형식입니다.' })
  phone: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '생년월일은 1999-01-01 형식이어야합니다.',
  })
  birth: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]{5,20}$/, {
    message: 'ID는 영문과 숫자만 5~20자, 한글/공백/특수문자 불가입니다.',
  })
  loginId: string;

  @IsString()
  @Length(8, 32)
  password: string;

  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @Validate(EmailDomainValidator)
  email: string;

  @IsOptional()
  @IsArray()
  @IsIn(['USER', 'ADMIN', 'OPERATOR', 'AUDITOR'], { each: true })
  roles?: string[];
}
