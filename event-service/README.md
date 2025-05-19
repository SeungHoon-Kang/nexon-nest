# Event Reward Service

이벤트 보상 시스템 서비스입니다. 사용자의 활동에 따른 보상을 자동으로 지급하고 관리하는 시스템입니다.

MSA 환경을 시연하기 위해서 gateway-service, auth-service, event-service 총 3개의 레포로 분리하였습니다.

## 주요 기능

### 1. 이벤트 관리
- 이벤트 생성, 조회, 수정, 삭제
- 이벤트별 보상 조건 및 보상 설정
- 활성/비활성 이벤트 관리

### 2. 보상 관리
- 보상 생성 및 조회
- 보상 지급 이력 관리
- 보상 조건 충족 여부 자동 체크

### 3. 보상 조건
- 연속 로그인 (CONSECUTIVE_LOGIN_3_DAYS)
- 누적 로그인 (CUMULATIVE_LOGIN_7_DAYS)
- 특정일 로그인 (SPECIFIC_DATE_LOGIN)
- 복귀 유저 (RETURNING_USER)
- 신규 유저 (NEW_USER)

### 4. 사용자 보상
- 자동 보상 지급
- 보상 지급 이력 조회
- 중복 지급 방지

## 기술 스택

- NestJS
- MongoDB (Mongoose)
- TypeScript

## 데이터 모델

### Event
```typescript
{
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  rewards: {
    rewardCondition: string;
    rewardId: string;
    title: string;
  }[];
  isActive: boolean;
}
```

### Reward
```typescript
{
  name: string;
  description?: string;
  points: number;
  isActive: boolean;
}
```

### EventUser
```typescript
{
  userId: string;
  eventId: string;
  rewardedAt: Date;
}
```

## API 엔드포인트

### 이벤트 API
- `POST /api/v1/event/create` - 이벤트 생성
- `GET /api/v1/event/list` - 이벤트 목록 조회
- `GET /api/v1/event/show/:id` - 이벤트 상세 조회
- `POST /api/v1/event/update/:id` - 이벤트 수정
- `POST /api/v1/event/delete/:id` - 이벤트 삭제

### 보상 API
- `POST /api/v1/reward/create` - 보상 생성
- `GET /api/v1/reward/list` - 보상 목록 조회
- `GET /api/v1/reward/hist` - 보상 지급 이력 조회
- `POST /api/v1/reward/request` - 보상 요청

## 설치 및 실행

1. 의존성 설치
```bash
yarn
```

2. 환경 변수 설정
```bash
MONGO_URI=mongodb://localhost:27017/event-reward
```

3. 서버 실행
```bash
yarn start:dev
```

## 보상 조건 상세

### 연속 로그인 (CONSECUTIVE_LOGIN_3_DAYS)
- 최근 3일간 연속으로 로그인한 경우

### 누적 로그인 (CUMULATIVE_LOGIN_7_DAYS)
- 최근 7일간 총 7일 이상 로그인한 경우

### 특정일 로그인 (SPECIFIC_DATE_LOGIN)
- 지정된 특정 날짜에 로그인한 경우

### 복귀 유저 (RETURNING_USER)
- 마지막 로그인으로부터 1년 이상 지난 경우

### 신규 유저 (NEW_USER)
- 회원가입 후 30일 이내인 경우
