export type CardState = { open: boolean; index: number };

export type CardAction =
  | { type: 'open' }
  | { type: 'toggle'; count: number }
  | { type: 'next'; count: number }
  | { type: 'close' };

export const initialCardState: CardState = { open: false, index: 0 };

export function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'open':
      return state.open ? state : { open: true, index: 0 };
    case 'toggle':
      return state.open
        ? cardReducer(state, { type: 'next', count: action.count })
        : { open: true, index: 0 };
    case 'next':
      return state.open ? { open: true, index: (state.index + 1) % action.count } : state;
    case 'close':
      return initialCardState;
  }
}
