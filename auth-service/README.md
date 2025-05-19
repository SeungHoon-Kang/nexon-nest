# Event Reward Auth Service

이벤트 리워드 시스템의 인증 서비스입니다. NestJS와 MongoDB를 사용하여 구현되었습니다.

MSA 환경을 시연하기 위해서 gateway-service, auth-service, event-service 총 3개의 레포로 분리하였습니다.

## 주요 기능

### 1. 사용자 인증
- 회원가입
- 로그인/로그아웃
- JWT 기반 인증
- 리프레시 토큰 관리
- 로그인 기록 관리

### 2. 권한 관리
- 역할 기반 접근 제어
- 관리자/운영자/감사/일반 사용자 권한 구분
- API 엔드포인트별 권한 설정

### 3. 보안
- 비밀번호 암호화 (bcrypt)
- JWT 토큰 기반 인증
- 리프레시 토큰 자동 갱신
- 로그인 시도 기록

## 기술 스택

- NestJS
- MongoDB
- JWT, Passport

## API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신

### 사용자 관리
- `GET /api/v1/auth/users/me/:userId` - 내 정보 조회
- `GET /api/v1/auth/users/all` - 전체 사용자 조회 (관리자/운영자/감사만)

## 데이터베이스 스키마

### User
```typescript
{
  loginId: string;
  password: string;
  name: string;
  phone: string;
  birth: string;
  email: string;
  roles: string[];
}
```

### RefreshToken
```typescript
{
  userId: ObjectId;
  token: string;
  expiresAt: Date;
}
```

### UserLogin
```typescript
{
  userId: ObjectId;
  loginAt: Date;
  accessToken: string;
  refreshToken: string;
}
```

## 설치 및 실행

1. 의존성 설치
```bash
yarn
```

2. 개발 서버 실행
```bash
yarn start:dev
```

## 보안 고려사항

1. 비밀번호 정책
   - 최소 8자 이상
   - 영문, 숫자, 특수문자 조합

2. 토큰 관리
   - Access Token: 1일
   - Refresh Token: 7일
   - 자동 갱신 메커니즘

3. 권한 관리
   - ADMIN: 모든 권한
   - OPERATOR: 운영 권한
   - AUDITOR: 조회 권한
   - USER: 기본 권한

## 로깅 및 모니터링

- 로그인 시도 기록
- 토큰 발급/갱신 기록
- 에러 로깅
- MongoDB 연결 상태 모니터링

## 개발 가이드

### 코드 구조
```
src/
├── auth/
│   ├── dto/
│   ├── schema/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
└── main.ts
```


