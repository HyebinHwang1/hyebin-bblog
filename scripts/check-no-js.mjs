// 글 상세 페이지는 JS 없이 읽혀야 한다. 빌드 결과에 <script>가 있으면 실패시킨다.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = 'dist/posts';
const entries = await readdir(dir, { recursive: true }).catch(() => []);
const pages = entries.filter((f) => f.endsWith('.html'));
const offenders = [];
for (const page of pages) {
  const html = await readFile(join(dir, page), 'utf8');
  if (/<script\b(?![^>]*type="application\/ld\+json")/i.test(html)) offenders.push(page);
}
if (offenders.length) {
  console.error(`글 페이지에 <script>가 있습니다:\n${offenders.join('\n')}`);
  process.exit(1);
}
console.log(`글 페이지 ${pages.length}개, <script> 없음`);
