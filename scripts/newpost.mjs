import { mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [title, slug] = process.argv.slice(2);
if (!title?.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '')) {
  console.error('用法：node scripts/newpost.mjs "文章标题" "english-slug"（短名仅支持小写字母、数字和单个连字符）');
  process.exit(1);
}

const posts = fileURLToPath(new URL('../content/posts', import.meta.url));
const now = new Date();
const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, -1);
const meta = { title, date: localDate, summary: '文章简介', mathDelimiter: '$$' };
// Publish the two source files together; an existing article directory wins a collision.
const temp = await mkdtemp(path.join(path.dirname(posts), '.newpost-'));
try {
  await writeFile(path.join(temp, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  await writeFile(path.join(temp, 'body.html'), '<h2>一级标题</h2>\n<p>文本</p>\n');
  await rename(temp, path.join(posts, slug));
  console.log(`已创建 content/posts/${slug}/。构建后可访问 /posts/${slug}/`);
} catch (error) {
  if (!['EEXIST', 'ENOTEMPTY', 'EPERM'].includes(error.code)) throw error;
  console.error(`无法创建文章，请检查短名是否已存在：${slug}`);
  process.exitCode = 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
