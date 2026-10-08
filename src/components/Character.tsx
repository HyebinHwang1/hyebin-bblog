import { Component, lazy, Suspense, useReducer, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { cards } from '../data/cards';
import { cardReducer, initialCardState } from '../lib/cards';

// three.js는 WebGL이 될 때만 내려받는다
const Scene = lazy(() => import('./character/Scene'));

let webglSupported: boolean | undefined;
function detectWebGL(): boolean {
  if (webglSupported === undefined) {
    try {
      const canvas = document.createElement('canvas');
      webglSupported = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      webglSupported = false;
    }
  }
  return webglSupported;
}
const noop = () => () => {};

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = matchMedia('(prefers-reduced-motion: reduce)');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  );
}

/** 3D가 실패하면 아무것도 그리지 않는다. 스테이지의 폴백 PNG가 그대로 남는다 */
class FallbackBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Character() {
  const supported = useSyncExternalStore(noop, detectWebGL, () => false);
  const reducedMotion = useReducedMotion();
  const [cardState, dispatch] = useReducer(cardReducer, initialCardState);
  const [ready, markReady] = useReducer(() => true, false);
  const rootRef = useRef<HTMLDivElement>(null);

  // client:visible은 이 요소가 화면에 들어오는지로 로드 시점을 잡으므로 서버에서도 빈 래퍼를 그린다
  if (!supported) return <div className="absolute inset-0" />;

  const handleReady = () => {
    rootRef.current?.closest('[data-stage]')?.setAttribute('data-ready', '');
    markReady();
  };

  const card = cards[cardState.index];

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >
      <FallbackBoundary>
        <Suspense fallback={null}>
          <Scene
            reducedMotion={reducedMotion}
            onReady={handleReady}
            onCharacterClick={() => dispatch({ type: 'toggle', count: cards.length })}
            onMiss={() => dispatch({ type: 'close' })}
          />
        </Suspense>
      </FallbackBoundary>

      {ready && !cardState.open && (
        <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-[0.8125rem] text-muted">
          캐릭터를 눌러보세요
        </p>
      )}

      <section
        aria-live="polite"
        aria-hidden={!cardState.open}
        inert={!cardState.open}
        className={`absolute inset-x-4 bottom-4 rounded-card border border-line bg-bg/95 p-5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] backdrop-blur-sm transition-all duration-300 ease-out ${
          cardState.open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
      >
        <div className="flex items-center gap-1.5" aria-label={`${cards.length}장 중 ${cardState.index + 1}번째`}>
          {cards.map((c, i) => (
            <span
              key={c.title}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === cardState.index ? 'w-4 bg-teal' : 'w-1.5 bg-line'
              }`}
            />
          ))}
        </div>
        <h3 className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">{card.title}</h3>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2 [word-break:keep-all]">{card.body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'close' })}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-mint"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'next', count: cards.length })}
            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-mint"
          >
            다음
          </button>
        </div>
      </section>
    </div>
  );
}
