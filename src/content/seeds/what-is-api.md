---
title: "API가 뭔가요?"
date: 2026-04-06
summary: "카페 카운터에서 SOAP, REST, GraphQL까지 — API의 개념과 흐름을 한 번에 정리한다"
tags: ["note"]
demo: "ApiFlowDemo"
---

스마트폰으로 날씨를 확인하고, 카카오톡으로 메시지를 보내고, 네이버 지도에서 식당을 검색한다. 이 모든 동작의 뒤에는 API가 있다.

API는 Application Programming Interface의 약자다. 그런데 이름만 보면 대체 뭐하는 건지 감이 잘 안 온다. 한마디로 하면, 두 시스템이 대화하는 규칙이다.

## 1. 카페에서 생각해보자

카페에 가면 카운터에서 주문한다. "아이스 아메리카노 한 잔 주세요." 바리스타가 만들어서 건네준다.

여기서 카운터가 API다.

- 나(클라이언트): 요청을 보내는 줁
- 카운터(API): 요청을 받고 결과를 돌려주는 중간 연결 지점
- 바리스타(서버): 실제로 일을 처리하는 줁
내가 직접 친점에 들어가서 에스프레소 머신을 조작할 필요는 없다. 카운터에 말하면 된다. API도 똑같다. 앱이 서버의 내부 구조를 알 필요 없이, 정해진 방식으로 요청하고 결과를 받는다.

좀 더 정확하게 그리면 이렇다.

```javascript
[클라이언트] --요청--> [API] --응답--> [클라이언트]
```

GET /weather?city=seoul 같은 요청을 보내면, 서버가 서울 날씨 데이터를 JSON으로 돌려준다. 서버의 데이터베이스 구조나 인증 로직을 알 필요 없다. 그게 API의 핵심이다.

## 2. SOAP, REST, GraphQL — 규칙의 변천사

"대화 규칙"이 있다고 했는데, 그 규칙은 시대에 따라 달라졌다.

### SOAP — 등기우편 스타일

2000년대 초반의 주류. Simple Object Access Protocol이라는 이름이 붙어있지만 전혀 simple하지 않다.

```xml
<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <GetWeather>
      <City>Seoul</City>
    </GetWeather>
  </soap:Body>
</soap:Envelope>
```

날씨 하나 물어보는데 이 정도다. XML로 봉투를 만들고, 봉투 안에 또 봉투를 넣고, 그 안에 요청을 넣는다. 보안이나 트랜잭션 처리가 표준화되어 있어서 은행에서는 아직도 쓰지만, 웹 개발자 입장에서는 배보다 배꼽이 더 컴다.

### REST — 웹을 그대로 쓰자

Roy Fielding이 2000년 박사 논문에서 제안했다. HTTP를 이미 쓰고 있으니까, 그걸 그대로 활용하자는 게 핵심이다.

```javascript
GET    /users/42        → 42번 유저 조회
POST   /users           → 유저 생성
PUT    /users/42        → 42번 유저 정보 수정
DELETE /users/42        → 42번 유저 삭제
```

URL이 주소고, HTTP 메서드가 동사다. 직관적이다.

그런데 "우리 REST API 쓰고 있어요"라고 말하는 서비스 중 상당수는 엄밀히 REST가 아니다. Fielding의 논문은 HATEOAS 같은 제약을 포함하는데, 대부분의 API는 이걸 무시한다. 그래서 "RESTful"이라는 애매한 표현도 생겼다. 실무에서는 이 구분이 크게 중요하지 않다. JSON으로 데이터 주고받고, URL이 리소스를 나타내면 다들 "그냥 REST"라고 부른다.

### GraphQL — 필요한 것만 달라

Facebook이 2015년에 공개했다. REST의 문제 중 하나는 데이터를 너무 많이 받거나 너무 적게 받는 것이다. 유저 이름만 필요한데 GET /users/42를 호출하면 주소, 전화번호, 프로필 사진까지 전부 날아온다.

```graphql
query {
  user(id: 42) {
    name
    posts(last: 5) {
      title
    }
  }
}
```

필요한 필드만 콩 집어서 요청하면, 딱 그만큼만 온다. 모바일처럼 대역폭이 아쉼운 환경에서 특히 유용하다.

### 비교

대부분의 웹 서비스는 REST로 충분하다. 데이터 구조가 복잡해지면 GraphQL을 고려하고, 은행 시스템을 만들 일이 아니면 SOAP은 보게 될 일이 없다.

## 3. Postman으로 직접 때려보기

이론만으로는 감이 안 온다. 직접 API를 호출해보는 게 가장 빠른 방법이다.

Postman은 API를 테스트할 수 있는 GUI 도구다. 원래 Chrome 확장으로 시작했는데 지금은 독립 앱이다. 코드 없이 API를 테스트할 수 있어서 백엔드 개발자부터 PM까지 널리 쓴다. 물론 터미널에서 curl로도 된다.

```bash
curl https://jsonplaceholder.typicode.com/posts/1
```

이걸 치면 JSON이 콕 나온다. 그런데 헤더를 붙이고, 바디를 넣고, 응답을 정리해서 보려면 커맨드라인이 점점 길어진다. Postman은 이걸 GUI로 편하게 해준다.

### 실습: 공개 API 호출해보기

JSONPlaceholder라는 무료 테스트 API가 있다. 아무나 호출할 수 있고, 가짜 데이터를 돌려준다.

게시글 조회:

```javascript
GET https://jsonplaceholder.typicode.com/posts/1
```

응답:

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident...",
  "body": "quia et suscipit\nsuscipit recusandae..."
}
```

여기서 부 것: HTTP 메서드는 GET(조회), URL은 리소스 경로(/posts/1), 응답 코드는 200 OK, 응답 바디는 JSON 객체다.

새 게시글 작성:

```javascript
POST https://jsonplaceholder.typicode.com/posts
Content-Type: application/json

{
  "title": "My First Post",
  "body": "Hello API world",
  "userId": 1
}
```

응답 코드 201 Created. 성공적으로 만들어졌다는 뜻이다 (테스트 API라 실제 저장되진 않는다).

### 응답 코드 읽는 법

외울 필요 없다. 패턴만 알면 된다.

- 2xx: 성공 (200 OK, 201 Created, 204 No Content)
- 4xx: 클라이언트가 잘못함 (400 Bad Request, 401 Unauthorized, 404 Not Found)
- 5xx: 서버가 터짐 (500 Internal Server Error)
404는 웹 브라우저에서도 본 적 있을 것이다. "그 페이지 없어요." API도 똑같다.

## 4. 요청이 서버에 도달하기까지

Postman에서 Send를 누르면 응답이 온다. 그 사이에 무슨 일이 벌어지는 걸까?

```javascript
[브라우저] → [DNS] → [인터넷] → [로드밸런서] → [웹 서버] → [API 서버] → [DB]
```

DNS — 브라우저에 [api.example.com](http://api.example.com/)을 입력하면, 먼저 이 도메인의 IP 주소를 찾는다. 전화번호부를 뒤져서 이름으로 번호를 찾는 것과 비슷하다.

TCP/TLS — IP를 알았으니 연결을 만든다. HTTPS라면 TLS 핸드셰이크가 일어난다. 서로 신분을 확인하고 암호화 키를 교환하는 과정. 이것 때문에 중간에서 누가 엿들어도 내용을 볼 수 없다.

로드밸런서 — 서버가 한 대일 리는 없다. 여러 대의 서버에서 돌아가고, 로드밸런서가 요청을 분배한다. 식당의 대기표 같은 것이다.

웹 서버 → API 서버 → DB:

```javascript
GET /posts/1
  → Nginx: "이거 API 요청이네, 백엔드로 넘기자"
  → Node.js: "posts 테이블에서 id=1 조회"
  → PostgreSQL: "SELECT * FROM posts WHERE id = 1"
  → 결과를 JSON으로 포장해서 돌려보냄
```

API 호출이 느릴 때 어디서 병목이 생기는지 알려면 이 구조를 알아야 한다. "그냥 API가 느려요"라고 말하는 것과 "로드밸런서에서 특정 서버로 가는 요청이 느려요"라고 말하는 것은 해결 속도가 다르다.

아래 데모에서 Send 버튼을 눌러보면, 실제 API 요청이 이 단계들을 거치는 모습을 확인할 수 있다.

## 5. References

여기서부터는 각자 필요한 방향으로 파면 된다.

기초 개념:

- MDN Web Docs — HTTP Overview: HTTP 메서드, 상태 코드, 헤더를 가장 잘 정리한 문서
- RESTful API Design — Best Practices: URL 설계, 버전 관리, 에러 처리 패턴
도구:

- Postman: GUI로 API 테스트와 문서화
- [httpbin.org](http://httpbin.org/): 요청을 그대로 되돌려주는 테스트 서버
- JSONPlaceholder: 가짜 REST API. 회원가입 없이 바로 쓸 수 있다
규격:

- OpenAPI (Swagger): REST API 스펙을 YAML/JSON으로 정의하는 표준
- GraphQL Spec: 스키마, 리졸버, 타입 시스템 정의
- gRPC: Google의 RPC 프레임워크. 마이크로서비스 간 통신에서 많이 쓴다
읽을거리:

- Roy Fielding의 박사 논문 (Chapter 5): REST의 원본. 5장만 읽어도 의도를 이해할 수 있다
- "API Design Patterns" (JJ Geewax, Manning): API 설계 시 반복적으로 등장하는 패턴들을 정리한 책
