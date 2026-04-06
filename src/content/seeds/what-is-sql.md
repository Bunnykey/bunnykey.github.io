---
title: "SQL이 뭔가요?"
date: 2026-04-06
summary: "데이터베이스에 말을 거는 언어, SQL — 쿼리부터 배포까지 한 번에 정리한다"
tags: ["note"]
---

인스타그램에 올린 사진, 쿠팡 주문 내역. 전부 데이터베이스에 들어있다. SQL은 그 데이터베이스에 말을 거는 언어다.

## 1. 쿼리가 뭔데

쿼리(Query)는 말 그대로 "질문"이다. 데이터베이스에 던지는 질문.

"서울에 사는 유저 목록 줘." 이걸 구조화된 형태로 적으면 쿼리다. 엑셀에서 필터 걸고 조건에 맞는 행만 골라내는 거랑 같다. 다만 마우스 대신 텍스트로 한다.

```sql
SELECT name, email FROM users WHERE city = '서울';
```

이게 끝이다. 영어 문장 읽듯이 읽힌다. users 테이블에서(FROM), 도시가 서울인 사람들 중(WHERE), 이름과 이메일을 골라서(SELECT) 가져와라.

돌아오는 건 엑셀 시트 한 장이라고 보면 된다.

```
+--------+-------------------+
| name   | email             |
+--------+-------------------+
| 민수   | minsu@example.com |
| 지연   | jiyeon@email.kr   |
+--------+-------------------+
```

## 2. SQL이라는 언어

SQL은 Structured Query Language의 약자다. 1970년대에 IBM에서 만들었다. 50년 넘게 살아남은 프로그래밍 언어는 많지 않다.

SQL이 할 수 있는 건 크게 네 가지다. CRUD라고 부른다.

```sql
-- Create: 데이터 넣기
INSERT INTO users (name, email, city)
VALUES ('민수', 'minsu@example.com', '서울');

-- Read: 데이터 읽기
SELECT * FROM users WHERE city = '서울';

-- Update: 데이터 수정
UPDATE users SET city = '부산' WHERE name = '민수';

-- Delete: 데이터 삭제
DELETE FROM users WHERE name = '민수';
```

이 네 가지면 웬만한 데이터 조작은 다 된다. 복잡한 분석이 필요하면 JOIN, GROUP BY, 서브쿼리 같은 것들을 쓰지만, 기본은 이거다.

SQL은 "뭘 원하는지"만 적는다. 어떻게 찾을지는 DB가 알아서 한다. 선언형 언어라고 부르는데, Ctrl+F를 누르면 엑셀이 알아서 검색하는 것과 같은 구조다.

## 3. PostgreSQL

SQL을 실행하려면 데이터베이스 소프트웨어가 필요하다. SQL은 언어이고, 그 언어를 알아듣는 프로그램이 따로 있다. 이걸 RDBMS(관계형 데이터베이스 관리 시스템)라고 부른다.

종류가 꽤 많다.

```
+---------------+------------------+---------------------------+
| 이름          | 라이선스         | 주로 쓰는 곳              |
+---------------+------------------+---------------------------+
| PostgreSQL    | 오픈소스 (무료)  | 스타트업, 웹 서비스       |
| MySQL         | 오픈소스 (무료)  | 워드프레스, 레거시 시스템  |
| SQLite        | 퍼블릭 도메인    | 모바일 앱, 임베디드       |
| Oracle        | 상용 (비쌈)      | 대기업, 금융              |
| SQL Server    | 상용             | 윈도우 서버 환경          |
+---------------+------------------+---------------------------+
```

요즘 웹 서비스에서 가장 많이 보이는 건 PostgreSQL이다. 보통 "포스트그레스"라고 읽는다. 무료이고 안정적이다. Supabase, Neon, Railway 같은 클라우드 서비스들이 기본으로 쓴다.

MySQL과 뭐가 다르냐면, JSON 지원이 크다. PostgreSQL은 JSON을 네이티브로 다룬다. 유연한 스키마가 필요해도 별도 DB 없이 처리된다.

```sql
-- PostgreSQL의 JSON 지원
SELECT profile->>'avatar_url'
FROM users
WHERE profile->>'theme' = 'dark';
```

이런 쿼리가 PostgreSQL에서는 된다. MySQL에서는 안 되거나 훨씬 번거롭다.

## 4. 소스에 있나요? 어디 저장되는 건가요?

코드는 Git에 있고, 이미지는 S3에 올린다. 데이터베이스는?

```
프로젝트 폴더
├── src/           ← 소스코드 (Git에 저장)
├── public/        ← 정적 파일 (Git에 저장)
├── .env           ← DB 접속 정보 (Git에 올리면 안 됨!)
└── (DB는 여기 없음)

데이터베이스 서버 (별도 머신)
└── /var/lib/postgresql/data/
    ├── base/      ← 실제 테이블 데이터 파일
    ├── pg_wal/    ← 변경 로그 (복구용)
    └── pg_xact/   ← 트랜잭션 상태
```

핵심은 이거다: **데이터베이스는 소스코드 안에 없다.** 별도의 서버(또는 서비스)에서 실행되고, 앱은 네트워크를 통해 접속한다.

접속 정보는 보통 이런 형태다.

```
postgresql://username:password@hostname:5432/dbname
```

이걸 환경변수(.env)에 넣어두고 코드에서 읽는다. 절대 Git에 커밋하면 안 된다. 한 번 올라가면 Git 히스토리에 영원히 남는다.

로컬 개발할 때는 내 맥에 PostgreSQL을 설치해서 쓰거나, Docker로 띄운다.

```bash
# Docker로 PostgreSQL 띄우기
docker run -d \
  --name my-postgres \
  -e POSTGRES_PASSWORD=mysecret \
  -p 5432:5432 \
  postgres:16
```

이러면 localhost:5432에 DB가 뜬다. 개발 끝나면 컨테이너 지우면 그만이다.

## 5. 실제 웹 서비스에서는 이렇게 쓴다

블로그 서비스를 예로 들면, API 요청이 DB까지 가는 구조는 이렇다.

```
[브라우저]
    ↓ GET /posts?tag=sql
[API 서버 (Node.js)]
    ↓ SQL 쿼리 실행
[PostgreSQL]
    ↓ 결과 반환
[API 서버]
    ↓ JSON 변환
[브라우저]
    ↓ 화면에 렌더링
```

API 서버 코드에서 SQL을 직접 쓰면 이렇다.

```javascript
// Node.js + pg 라이브러리
const result = await db.query(
  'SELECT id, title, summary FROM posts WHERE $1 = ANY(tags) ORDER BY date DESC',
  ['sql']
);
// result.rows → [{id: 1, title: "SQL이 뭔가요?", summary: "..."}]
```

실무에서는 SQL 대신 ORM을 쓰는 경우가 많다. Prisma나 Drizzle 같은 것들이다. 같은 쿼리를 Prisma로 쓰면 이렇다.

```typescript
// Prisma ORM
const posts = await prisma.post.findMany({
  where: { tags: { has: 'sql' } },
  orderBy: { date: 'desc' },
  select: { id: true, title: true, summary: true },
});
```

간단한 CRUD는 ORM으로 충분하다. 그런데 성능이 안 나오거나 마이그레이션이 꼬이면 ORM이 만들어낸 SQL을 직접 읽어야 한다. 그때 SQL을 모르면 막힌다.

## 6. 배포는 어떻게 하나

로컬에서 개발할 때는 Docker로 DB를 띄우면 되지만, 실제 서비스를 배포할 때는 다른 방법을 쓴다.

### 직접 운영

EC2 같은 서버에 PostgreSQL을 설치하고 직접 관리한다. 백업부터 장애 대응까지 전부 내 몫이다. DBA가 있는 팀이 아니면 추천하지 않는다.

### 관리형 서비스 (Managed)

클라우드 업체가 DB를 운영해주고, 나는 접속해서 쓰기만 하면 된다.

```
+-------------------+------------------+------------------+
| 서비스            | 특징             | 무료 티어        |
+-------------------+------------------+------------------+
| Supabase          | PostgreSQL + API | 500MB, 2개 프로젝트 |
| Railway           | 간편한 배포      | 월 $5 크레딧     |
| Neon              | 서버리스 PG      | 512MB            |
| AWS RDS           | 엔터프라이즈     | 12개월 무료      |
| Google Cloud SQL  | GCP 생태계       | 무료 체험        |
+-------------------+------------------+------------------+
```

개인 프로젝트라면 Supabase나 Neon이 가장 시작하기 쉽다. 가입하면 PostgreSQL이 바로 생기고, 접속 URL을 복사해서 .env에 넣으면 끝이다.

### 스키마 관리 (마이그레이션)

DB 구조(테이블, 컬럼)를 변경할 때는 마이그레이션을 쓴다. 코드 변경에 Git이 있는 것처럼, DB 구조 변경에는 마이그레이션이 있다.

```sql
-- 마이그레이션 파일 예시: 0001_create_posts.sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT[],
  date TIMESTAMP DEFAULT NOW()
);
```

이 파일을 Git에 넣고, 배포할 때 순서대로 실행한다. 이러면 개발 DB와 프로덕션 DB의 구조가 항상 동기화된다. Prisma는 `prisma migrate deploy`, Drizzle은 `drizzle-kit push`로 이걸 자동화해준다.

실제 배포는 이런 순서다.

```
1. 코드 작성 (+ 마이그레이션 파일)
2. Git push
3. CI/CD가 마이그레이션 실행 → DB 구조 업데이트
4. 새 코드 배포 → API 서버 재시작
5. 끝
```

한 번 세팅하면 `git push` 한 번으로 코드와 DB가 같이 움직인다.
