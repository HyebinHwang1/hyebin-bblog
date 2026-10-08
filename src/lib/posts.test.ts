import { describe, expect, it } from 'vitest';
import { formatDate, getAdjacentPosts, slugFromId, sortPublishedPosts } from './posts';

type TestPost = { id: string; data: { date: Date; draft: boolean } };

const post = (id: string, date: string, draft = false): TestPost => ({
  id,
  data: { date: new Date(date), draft },
});

describe('slugFromId', () => {
  it('파일명 앞의 날짜 접두사를 뗀다', () => {
    expect(slugFromId('2026-09-21-tailwind-migration')).toBe('tailwind-migration');
  });

  it('날짜 접두사가 없으면 빌드를 멈추도록 에러를 던진다', () => {
    expect(() => slugFromId('tailwind-migration')).toThrow(/YYYY-MM-DD-slug/);
  });

  it('날짜 뒤에 slug가 없으면 에러를 던진다', () => {
    expect(() => slugFromId('2026-09-21')).toThrow();
  });
});

describe('sortPublishedPosts', () => {
  const posts = [
    post('2026-09-01-a', '2026-09-01'),
    post('2026-09-21-b', '2026-09-21'),
    post('2026-09-10-draft', '2026-09-10', true),
    post('2026-09-21-a', '2026-09-21'),
  ];

  it('draft를 빼고 최신순으로 정렬한다', () => {
    expect(sortPublishedPosts(posts).map((p) => p.id)).toEqual([
      '2026-09-21-a',
      '2026-09-21-b',
      '2026-09-01-a',
    ]);
  });

  it('includeDrafts면 draft도 포함한다', () => {
    expect(sortPublishedPosts(posts, { includeDrafts: true }).map((p) => p.id)).toContain(
      '2026-09-10-draft',
    );
  });

  it('원본 배열을 바꾸지 않는다', () => {
    const before = posts.map((p) => p.id);
    sortPublishedPosts(posts);
    expect(posts.map((p) => p.id)).toEqual(before);
  });
});

describe('getAdjacentPosts', () => {
  // 최신순
  const sorted = [post('c', '2026-09-03'), post('b', '2026-09-02'), post('a', '2026-09-01')];

  it('가운데 글은 이전(더 오래된) 글과 다음(더 최신) 글을 모두 가진다', () => {
    const { prev, next } = getAdjacentPosts(sorted, 'b');
    expect(prev?.id).toBe('a');
    expect(next?.id).toBe('c');
  });

  it('가장 최신 글은 다음 글이 없다', () => {
    expect(getAdjacentPosts(sorted, 'c')).toEqual({ prev: sorted[1], next: undefined });
  });

  it('가장 오래된 글은 이전 글이 없다', () => {
    expect(getAdjacentPosts(sorted, 'a')).toEqual({ prev: undefined, next: sorted[1] });
  });

  it('글이 1편이면 둘 다 없다', () => {
    expect(getAdjacentPosts([sorted[0]], 'c')).toEqual({ prev: undefined, next: undefined });
  });
});

describe('formatDate', () => {
  it('YYYY.MM.DD로 표기한다', () => {
    expect(formatDate(new Date('2026-09-01'))).toBe('2026.09.01');
  });

  it('frontmatter 날짜(UTC 자정)가 시간대 때문에 하루 밀리지 않는다', () => {
    expect(formatDate(new Date('2026-12-31T00:00:00Z'))).toBe('2026.12.31');
  });
});
