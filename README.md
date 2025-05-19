# Nexon Nest Microservices 프로젝트

## 개요

본 프로젝트는 다음과 같은 마이크로서비스들로 구성되어 있습니다:

- **auth-service** : 인증 및 사용자 관리 서비스  
- **event-service** : 이벤트 관련 서비스  
- **gateway-service** : API Gateway 및 요청 프록시 역할 수행  
- **mongodb** : 데이터베이스 (MongoDB)  

---

## Docker Compose 실행 방법

1. 프로젝트 루트에서 아래 명령어로 빌드합니다.

```bash
docker-compose build

docker-compose up -d

docker-compose logs -f
```


API 요청 방법 및 주의사항
	•	모든 API 호출은 반드시 Gateway 서비스 (http://localhost:3000)를 통해 해야 합니다.
	•	Gateway가 내부적으로 auth-service, event-service로 요청을 프록시합니다.
	•	직접 auth-service (포트 3001) 또는 event-service (포트 3002)에 요청하지 마세요.

예시: 회원가입 요청

POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "name": "홍길동",
  "phone": "01012345678",
  "birth": "1990-01-01",
  "loginId": "hong123",
  "password": "Password123!",
  "email": "hong@example.com",
  "roles": ["USER"]
}

** 권한이 필요한 기능들은 header 에 Bearer ${accessToken} 형식으로 요청을 해아 토큰 및 권한 검증이 됩니다.
   토큰을 같이 보내지 않을 경우, 토큰 검증에 실패하며, 요청에 실패하게 됩니다.



각 서비스별 README 안내
	•	각 서비스 디렉토리(auth-service/, event-service/, gateway-service/) 내에는
해당 서비스의 상세 내용과 API 명세가 포함된 README.md가 별도로 존재합니다.
	•	서비스별 상세 내용 확인 시 참고하시기 바랍니다.
