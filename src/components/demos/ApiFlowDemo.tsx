import { useState, useCallback, useRef } from 'react';
import DemoWrapper from './shared/DemoWrapper';

type StageId = 'idle' | 'dns' | 'tls' | 'lb' | 'server' | 'db' | 'response' | 'done';

interface Stage {
  id: StageId;
  label: string;
  description: string;
  ms: number;
}

const STAGES: Stage[] = [
  { id: 'dns', label: 'DNS', description: '도메인 → IP 주소 조회', ms: 0 },
  { id: 'tls', label: 'TLS', description: '암호화 연결 수립', ms: 0 },
  { id: 'lb', label: 'Load Balancer', description: '서버 분배', ms: 0 },
  { id: 'server', label: 'API Server', description: '요청 처리', ms: 0 },
  { id: 'db', label: 'DB', description: '데이터 조회', ms: 0 },
  { id: 'response', label: 'Response', description: 'JSON 응답 전송', ms: 0 },
];

const NODE_COLORS: Record<string, string> = {
  dns: '#f59e0b',
  tls: '#8b5cf6',
  lb: '#06b6d4',
  server: '#3b82f6',
  db: '#10b981',
  response: '#ef4444',
};

function Arrow({ active }: { active: boolean }) {
  return (
    <div style={{
      width: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      opacity: active ? 0.8 : 0.2,
      color: 'var(--color-foreground)',
      transition: 'opacity 0.3s ease',
    }}>
      →
    </div>
  );
}

function Node({ stage, active, current, elapsed }: {
  stage: Stage;
  active: boolean;
  current: boolean;
  elapsed: number;
}) {
  const color = NODE_COLORS[stage.id] || '#6b7280';
  const borderColor = current ? color : active ? color : 'var(--color-outline-subtle)';
  const bgOpacity = current ? 0.15 : active ? 0.08 : 0;

  return (
    <div style={{
      flex: '1 1 0',
      minWidth: '4.5rem',
      padding: '0.5rem',
      border: `1.5px solid ${borderColor}`,
      borderRadius: '0.375rem',
      textAlign: 'center',
      opacity: active || current ? 1 : 0.35,
      transition: 'all 0.3s ease',
      background: `rgba(${hexToRgb(color)}, ${bgOpacity})`,
      position: 'relative',
    }}>
      {current && (
        <div style={{
          position: 'absolute',
          top: '-0.25rem',
          right: '-0.25rem',
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '50%',
          backgroundColor: color,
          animation: 'pulse-dot 1s ease-in-out infinite',
        }} />
      )}
      <div style={{ fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.125rem' }}>
        {stage.label}
      </div>
      <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>
        {stage.description}
      </div>
      {active && elapsed > 0 && (
        <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color, marginTop: '0.25rem' }}>
          {elapsed}ms
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

interface RunResult {
  stages: Stage[];
  json: unknown;
  totalMs: number;
  url: string;
}

export default function ApiFlowDemo() {
  const [currentStage, setCurrentStage] = useState<StageId>('idle');
  const [completedStages, setCompletedStages] = useState<Set<StageId>>(new Set());
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [postId, setPostId] = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  const runRequest = useCallback(async () => {
    if (running) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setResult(null);
    setCompletedStages(new Set());

    const url = `https://jsonplaceholder.typicode.com/posts/${postId}`;
    const stageTiming: Stage[] = [];
    const stageIds: StageId[] = ['dns', 'tls', 'lb', 'server', 'db', 'response'];

    // Simulate the infrastructure stages, then do the real fetch
    for (let i = 0; i < stageIds.length; i++) {
      if (controller.signal.aborted) return;
      const id = stageIds[i];
      setCurrentStage(id);

      if (id === 'server') {
        // Real fetch happens here
        const t0 = performance.now();
        try {
          const res = await fetch(url, { signal: controller.signal });
          const json = await res.json();
          const fetchMs = Math.round(performance.now() - t0);

          // Split fetch time across server + db
          const serverMs = Math.round(fetchMs * 0.4);
          const dbMs = fetchMs - serverMs;

          stageTiming.push({ ...STAGES[i], ms: serverMs });
          setCompletedStages(prev => new Set([...prev, 'server']));

          // DB stage
          setCurrentStage('db');
          await sleep(Math.max(dbMs, 30));
          stageTiming.push({ ...STAGES[i + 1], ms: dbMs });
          setCompletedStages(prev => new Set([...prev, 'db']));

          // Response stage
          setCurrentStage('response');
          await sleep(40);
          stageTiming.push({ ...STAGES[i + 2], ms: 0 });
          setCompletedStages(prev => new Set([...prev, 'response']));

          const totalMs = stageTiming.reduce((s, st) => s + st.ms, 0);
          setCurrentStage('done');
          setResult({ stages: stageTiming, json, totalMs, url });
          setRunning(false);
          return;
        } catch {
          if (!controller.signal.aborted) {
            setCurrentStage('idle');
            setRunning(false);
          }
          return;
        }
      }

      // Simulated infrastructure stages
      const simMs = id === 'dns' ? randomBetween(5, 20)
        : id === 'tls' ? randomBetween(10, 40)
        : randomBetween(2, 8);

      await sleep(simMs);
      stageTiming.push({ ...STAGES[i], ms: simMs });
      setCompletedStages(prev => new Set([...prev, id]));
    }
  }, [running, postId]);

  const isDone = currentStage === 'done';

  return (
    <DemoWrapper title="API Request Flow">
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <code style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          background: 'var(--color-outline-subtle)',
          opacity: 0.8,
          flex: '1 1 auto',
          minWidth: '12rem',
        }}>
          GET /posts/{postId}
        </code>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[1, 2, 3].map(id => (
            <button
              key={id}
              onClick={() => !running && setPostId(id)}
              disabled={running}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.7rem',
                borderRadius: '0.25rem',
                border: `1px solid ${postId === id ? 'var(--accent-color, #60a5fa)' : 'var(--color-outline-subtle)'}`,
                background: postId === id ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                color: 'var(--color-foreground)',
                cursor: running ? 'not-allowed' : 'pointer',
                opacity: running ? 0.5 : 1,
              }}
            >
              #{id}
            </button>
          ))}
        </div>
        <button
          onClick={runRequest}
          disabled={running}
          style={{
            padding: '0.375rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '0.375rem',
            border: 'none',
            background: running ? 'var(--color-outline-subtle)' : 'var(--accent-color, #60a5fa)',
            color: running ? 'var(--color-foreground)' : '#fff',
            cursor: running ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {running ? '전송 중...' : isDone ? '다시 보내기' : 'Send'}
        </button>
      </div>

      {/* Flow diagram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.125rem',
        overflowX: 'auto',
        padding: '0.5rem 0',
        marginBottom: '1rem',
      }}>
        {STAGES.map((stage, i) => {
          const active = completedStages.has(stage.id);
          const current = currentStage === stage.id;
          const timing = result?.stages.find(s => s.id === stage.id);
          return (
            <div key={stage.id} style={{ display: 'contents' }}>
              {i > 0 && <Arrow active={active || current} />}
              <Node
                stage={stage}
                active={active}
                current={current}
                elapsed={timing?.ms || 0}
              />
            </div>
          );
        })}
      </div>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-outline-subtle)',
          background: 'rgba(16, 185, 129, 0.05)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            marginBottom: '0.5rem',
            opacity: 0.6,
          }}>
            <span>200 OK</span>
            <span>{result.totalMs}ms total</span>
          </div>
          <pre style={{
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            lineHeight: 1.5,
            opacity: 0.9,
          }}>
            {JSON.stringify(result.json, null, 2)}
          </pre>
        </div>
      )}

      <noscript>
        <p style={{ opacity: 0.5, fontStyle: 'italic' }}>
          이 데모는 JavaScript가 필요합니다.
        </p>
      </noscript>
    </DemoWrapper>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}
