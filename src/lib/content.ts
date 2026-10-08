import { getCollection, type CollectionEntry } from 'astro:content';
import { sortPublishedPosts } from './posts';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(): Promise<Post[]> {
  return sortPublishedPosts(await getCollection('posts'), { includeDrafts: import.meta.env.DEV });
}

/** base 경로(/hyebin-bblog/)를 붙인 사이트 내부 주소 */
export function href(path = ''): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
