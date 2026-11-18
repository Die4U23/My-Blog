export interface ArchivePost {
  slug: string;
  title: string;
  summary: string;
  date: string;
  listDate?: string;
}

// Replaceable editorial groupings for the explorer. The source posts have no category field.
export const topics = [
  { name: '精选文章', planet: { name: '土星', map: '/images/sky/saturn.jpg', color: '#c1ac88', scale: 1, tilt: -18, longitude: 0, rings: true },
    ids: ['starry-blog-redesign', 'evorec-from-scratch', 'raft-kv-project-practice', 'cpp-language-object-model', 'kmp-algorithm'] },
  { name: '项目实践', planet: { name: '地球', map: '/images/sky/earth_daymap.webp', color: '#71a39d', scale: 0.92, tilt: -12, longitude: 102, rings: false },
    ids: ['starry-blog-redesign', 'evorec-from-scratch', 'raft-kv-project-practice', 'searchpilot-project-practice', 'arcbench-agent-practice', 'klogg-longline-practice'] },
  { name: '算法笔记', planet: { name: '木星', map: '/images/sky/jupiter.webp', color: '#c79972', scale: 1.08, tilt: 9, longitude: 35, rings: false },
    ids: ['state-space-bfs-tsp', 'raft-algorithm', 'kmp-algorithm', 'manacher-algorithm', 'sorting-basics', 'find-the-duplicate-number', 'bitwise-toolbox', 'range-sum-of-bst', 'leetcode-problem-list'] },
  { name: 'C++ 手记', planet: { name: '火星', map: '/images/sky/mars.webp', color: '#c37c60', scale: 0.88, tilt: -16, longitude: 46, rings: false },
    ids: ['cpp-language-object-model', 'vector-bool-pitfalls', 'cpp-knowledge-notes', 'stl-notes'] },
  { name: '程序分析', planet: { name: '水星', map: '/images/sky/mercury.webp', color: '#ada8a5', scale: 0.79, tilt: 7, longitude: 85, rings: false },
    ids: ['bitvector-modular-analysis', 'karr-algorithm'] },
  { name: '全部文章', planet: { name: '海王星', map: '/images/sky/neptune.webp', color: '#779bd3', scale: 0.98, tilt: -22, longitude: 75, rings: false },
    ids: [] },
];

export function topicPosts(posts: ArchivePost[], face: number) {
  if (face === 5) return posts;
  const ids = topics[face].ids;
  const group = posts.filter(post => ids.includes(post.slug));
  return face === 0 ? group.sort((a, b) => ids.indexOf(a.slug) - ids.indexOf(b.slug)) : group;
}

export function articleTopic(slug: string) {
  return topics.slice(1, 5).find(topic => topic.ids.includes(slug))?.name ?? '未分类';
}
