import { describe, expect, it } from 'vitest';
import { cardReducer, initialCardState } from './cards';

const COUNT = 3;
const run = (...actions: Parameters<typeof cardReducer>[1][]) =>
  actions.reduce((s, a) => cardReducer(s, a), initialCardState);

describe('cardReducer', () => {
  it('처음에는 닫혀 있다', () => {
    expect(initialCardState.open).toBe(false);
  });

  it('캐릭터를 클릭하면 1번 카드가 열린다', () => {
    expect(run({ type: 'open' })).toEqual({ open: true, index: 0 });
  });

  it('다음을 누르면 1 → 2 → 3 → 1로 순환한다', () => {
    const next = { type: 'next', count: COUNT } as const;
    expect(run({ type: 'open' }, next).index).toBe(1);
    expect(run({ type: 'open' }, next, next).index).toBe(2);
    expect(run({ type: 'open' }, next, next, next).index).toBe(0);
  });

  it('닫으면 닫힌다', () => {
    expect(run({ type: 'open' }, { type: 'close' }).open).toBe(false);
  });

  it('닫았다가 다시 열면 1번 카드부터 시작한다', () => {
    const next = { type: 'next', count: COUNT } as const;
    expect(run({ type: 'open' }, next, { type: 'close' }, { type: 'open' })).toEqual({
      open: true,
      index: 0,
    });
  });

  it('카드가 열린 상태에서 캐릭터를 다시 클릭하면 다음 카드로 넘어간다', () => {
    expect(run({ type: 'open' }, { type: 'open' }).index).toBe(0);
    expect(run({ type: 'open' }, { type: 'toggle', count: COUNT }).index).toBe(1);
    expect(run({ type: 'toggle', count: COUNT })).toEqual({ open: true, index: 0 });
  });

  it('닫힌 상태에서 다음은 무시한다', () => {
    expect(run({ type: 'next', count: COUNT })).toEqual(initialCardState);
  });
});
