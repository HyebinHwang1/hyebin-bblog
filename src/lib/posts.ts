type PostLike = { id: string; data: { date: Date; draft: boolean } };

const ID_PATTERN = /^\d{4}-\d{2}-\d{2}-(.+)$/;

export function slugFromId(id: string): string {
  const match = ID_PATTERN.exec(id);
  if (!match) {
    throw new Error(`글 파일명은 YYYY-MM-DD-slug.md 형식이어야 합니다: "${id}"`);
  }
  return match[1];
}

export function sortPublishedPosts<T extends PostLike>(
  posts: readonly T[],
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): T[] {
  return posts
    .filter((p) => includeDrafts || !p.data.draft)
    .toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

/** sorted는 최신순. prev = 더 오래된 글, next = 더 최신 글 */
export function getAdjacentPosts<T extends PostLike>(
  sorted: readonly T[],
  id: string,
): { prev: T | undefined; next: T | undefined } {
  const i = sorted.findIndex((p) => p.id === id);
  return { prev: sorted[i + 1], next: i > 0 ? sorted[i - 1] : undefined };
}

export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`;
}
