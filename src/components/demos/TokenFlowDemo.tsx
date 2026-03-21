import React, { useState, useMemo } from 'react';
import DemoWrapper from './shared/DemoWrapper';
import { colors } from './shared/styles';

interface Step {
  id: string;
  label: string;
  tokens: number;
  color: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'system', label: 'System Prompt', tokens: 2400, color: colors.system, description: 'AGENTS.md + SOUL.md + USER.md — 에이전트의 정체성과 규칙. 항상 최우선 로드.' },
  { id: 'skills', label: 'Skill Stubs', tokens: 1800, color: colors.skills, description: '50개 스킬의 이름+설명만 로드. 실제 SKILL.md는 호출 시 on-demand.' },
  { id: 'memory', label: 'Memory', tokens: 3200, color: '#a855f7', description: 'LCM 요약 + MEMORY.md. 세션 간 연속성을 유지하는 핵심 레이어.' },
  { id: 'history', label: 'Chat History', tokens: 12000, color: '#06b6d4', description: '현재 세션 대화 기록. 가장 많은 토큰을 차지하며 compaction 대상.' },
  { id: 'user', label: 'User Message', tokens: 500, color: colors.user, description: '사용자의 현재 입력. 절대 잘리지 않음.' },
  { id: 'response', label: '← Response Budget', tokens: 4096, color: colors.response, description: '모델 응답을 위해 예약된 공간. 이것도 줄일 수 없음.' },
];

export default function TokenFlowDemo() {
  const [contextSize, setContextSize] = useState(200000);
  
  // User Message and Response Budget are never clipped — reserve them first
  const PROTECTED_IDS = new Set(['user', 'response']);
  const reservedTokens = STEPS.filter(s => PROTECTED_IDS.has(s.id)).reduce((sum, s) => sum + s.tokens, 0);
  
  const processedSteps = useMemo(() => {
    let remaining = contextSize - reservedTokens;
    return STEPS.map((step) => {
      if (PROTECTED_IDS.has(step.id)) {
        return { ...step, visibleTokens: step.tokens, clipped: false };
      }
      if (remaining <= 0) {
        return { ...step, visibleTokens: 0, clipped: true };
      }
      const visible = Math.min(step.tokens, remaining);
      remaining -= visible;
      return { ...step, visibleTokens: visible, clipped: visible < step.tokens };
    });
  }, [contextSize]);

  const used = processedSteps.reduce((sum, s) => sum + s.visibleTokens, 0);
  const pct = Math.round((used / contextSize) * 100);

  return (
    <DemoWrapper title="Context Window Token Flow">
      {/* Slider */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>Context Window</span>
          <span style={{ color: 'var(--accent-color, #60a5fa)' }}>
            {(contextSize / 1000).toFixed(0)}K tokens
          </span>
        </div>
        <input
          type="range"
          min={4000}
          max={200000}
          step={1000}
          value={contextSize}
          onChange={(e) => setContextSize(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-color, #60a5fa)' }}
          aria-label="Context window size"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.4 }}>
          <span>4K</span>
          <span>200K</span>
        </div>
      </div>

      {/* Bar visualization */}
      <div style={{ 
        display: 'flex', 
        height: '2.5rem', 
        borderRadius: '0.375rem', 
        overflow: 'hidden',
        border: '1px solid var(--border-color, #262626)',
        marginBottom: '1rem',
      }}>
        {processedSteps.map((step) => {
          const widthPct = (step.visibleTokens / contextSize) * 100;
          if (widthPct < 0.5) return null;
          return (
            <div
              key={step.id}
              title={`${step.label}: ${step.visibleTokens.toLocaleString()} tokens${step.clipped ? ' (clipped!)' : ''}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: step.clipped ? colors.clipped : step.color,
                opacity: step.clipped ? 0.4 : 0.8,
                transition: 'all 0.3s ease',
                minWidth: widthPct > 0 ? '2px' : 0,
              }}
            />
          );
        })}
        {/* Free space */}
        <div style={{ 
          flex: 1, 
          background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--border-color, #262626) 4px, var(--border-color, #262626) 5px)',
          opacity: 0.3,
        }} />
      </div>

      {/* Usage bar */}
      <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1.5rem', textAlign: 'right' }}>
        {used.toLocaleString()} / {contextSize.toLocaleString()} tokens ({pct}%)
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {processedSteps.map((step) => (
          <div 
            key={step.id}
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              background: step.clipped ? 'rgba(107, 114, 128, 0.1)' : 'transparent',
            }}
          >
            <div style={{
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '0.125rem',
              backgroundColor: step.clipped ? colors.clipped : step.color,
              opacity: step.clipped ? 0.4 : 1,
              flexShrink: 0,
              marginTop: '0.25rem',
            }} />
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{step.label}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                  {step.visibleTokens.toLocaleString()}/{step.tokens.toLocaleString()}
                  {step.clipped && ' ⚠️'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.125rem' }}>
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {processedSteps.some(s => s.clipped) && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '0.8rem',
        }}>
          ⚠️ 컨텍스트 윈도우가 작아서 일부 레이어가 잘렸습니다. 슬라이더를 올려보세요.
        </div>
      )}

      {/* No JS fallback hint */}
      <noscript>
        <p style={{ opacity: 0.5, fontStyle: 'italic' }}>
          이 데모는 JavaScript가 필요합니다. 간단히 말해: 200K 토큰 중 시스템 프롬프트→스킬→메모리→대화→응답 순으로 채워지며, 윈도우가 작으면 대화 기록부터 잘립니다.
        </p>
      </noscript>
    </DemoWrapper>
  );
}
