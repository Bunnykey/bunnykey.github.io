---
title: "Context Engineering — 토큰은 어떻게 흐르는가"
date: 2026-03-17
highlight: true
summary: "200K 컨텍스트 윈도우 안에서 시스템 프롬프트, 스킬, 메모리, 대화가 어떻게 배치되는지 시각화"
tags: ["AI", "Context Engineering", "Interactive"]
demo: "TokenFlowDemo"
---

AI 에이전트의 컨텍스트 윈도우는 한정된 자원이다. 200K 토큰이라고 해서 무한정 넣을 수 있는 게 아니라, 각 레이어가 순서대로 자리를 차지한다.

## 토큰 배치 순서

1. **System Prompt** — 에이전트의 정체성 (AGENTS.md, SOUL.md, USER.md)
2. **Skill Stubs** — 50개 스킬의 이름과 설명만 (on-demand 로딩)
3. **Memory** — LCM 요약 + 장기 기억
4. **Chat History** — 현재 세션 대화 (가장 큰 소비자)
5. **User Message** — 현재 입력 (절대 잘리지 않음)
6. **Response Budget** — 모델 응답 공간 (예약)

핵심 원칙: **정적인 것이 먼저, 동적인 것이 나중**. 이래야 프롬프트 캐싱이 작동한다.

## 인터랙티브 데모

아래 슬라이더로 컨텍스트 윈도우 크기를 줄여보면, 어떤 레이어부터 잘리는지 직관적으로 확인할 수 있다.
