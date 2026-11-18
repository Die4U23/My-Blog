import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { topics, topicPosts, articleTopic, type ArchivePost } from './archiveTopics';
import { mountPlanet } from './planetMotion';
import { GalaxyField, TopicPlanet } from './GalaxyScene';

function Profile() {
  return <aside className="profile" aria-label="关于作者">
    <img className="avatar" src="/images/img1.jpg" width="48" height="48" alt="Daydreamer 的头像" />
    <h2>Daydreamer</h2>
    <p>记录项目实践与算法笔记。</p>
    <a className="author-email" href="mailto:Daydreamer@sjtu.edu.cn">Daydreamer@sjtu.edu.cn</a>
    <a className="about-link" href="/about/">关于我 <span aria-hidden="true">↗</span></a>
  </aside>;
}

function highlightRow(event: PointerEvent<HTMLLIElement>) {
  if (event.pointerType !== 'mouse') return;
  const row = event.currentTarget;
  const rect = row.getBoundingClientRect();
  row.style.setProperty('--glow-x', event.clientX - rect.left + 'px');
  row.style.setProperty('--glow-y', event.clientY - rect.top + 'px');
}

const pageSize = 3;

function OrbitPager({ page, pages, onStep }: { page: number; pages: number; onStep: (step: number) => void }) {
  return <nav className="orbit-pager" aria-label="文章分页">
    <button type="button" aria-label="上一页" title="上一页" aria-controls="article-page"
      aria-disabled={page === 1} onClick={() => page > 1 && onStep(-1)}><ChevronUp aria-hidden="true" size={18} /></button>
    <span className="page-position" aria-live="polite" aria-atomic="true" aria-label={`第 ${page} 页，共 ${pages} 页`}>
      <span className="page-planet" aria-hidden="true" style={{ '--phase': (page - 1) / pages * 360 + 'deg' } as CSSProperties}>
        <i className="planet-orbit" />
      </span>
      <span className="page-counter">{page} / {pages}</span>
    </span>
    <button type="button" aria-label="下一页" title="下一页" aria-controls="article-page"
      aria-disabled={page === pages} onClick={() => page < pages && onStep(1)}><ChevronDown aria-hidden="true" size={18} /></button>
  </nav>;
}

export function ArticleExplorer({ posts }: { posts: ArchivePost[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [journey, setJourney] = useState<{ index: number; previous: number | null; direction: number }>({
    index: 0, previous: null, direction: 1,
  });
  const topicIndex = journey.index;
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [focusedTopic, setFocusedTopic] = useState<number | null>(null);
  const indicated = hoveredTopic ?? focusedTopic ?? topicIndex;
  const previewing = indicated !== topicIndex;
  const [topicPages, setTopicPages] = useState<Record<number, number>>({});
  const choose = useCallback((index: number) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setJourney(current => {
      if (index === current.index) return current;
      const forward = (index - current.index + topics.length) % topics.length;
      return { index, previous: reduced ? null : current.index, direction: forward <= topics.length / 2 ? 1 : -1 };
    });
  }, []);
  useEffect(() => {
    if (!section.current || !stage.current) return;
    return mountPlanet(section.current, stage.current, topicIndex, step => {
      choose((topicIndex + step + topics.length) % topics.length);
    });
  }, [topicIndex, choose]);
  useEffect(() => {
    if (journey.previous === null) return;
    const timer = window.setTimeout(() => setJourney(current => ({ ...current, previous: null })), 850);
    return () => window.clearTimeout(timer);
  }, [journey]);
  const groups = topics.map((_, index) => topicPosts(posts, index));
  const group = groups[topicIndex];
  const pages = Math.max(1, Math.ceil(group.length / pageSize));
  const page = Math.min(topicPages[topicIndex] ?? 1, pages);
  const start = (page - 1) * pageSize;
  function stepPage(step: number) {
    setTopicPages(prev => ({ ...prev, [topicIndex]: Math.max(1, Math.min(pages, (prev[topicIndex] ?? 1) + step)) }));
  }
  return <section id="articles" className="archive wrap" ref={section} aria-label="文章目录">
    <header className="archive-bar">
      <h2>文章星图</h2>
      <div className="topic-buttons" role="group" aria-label="选择文章主题"
        onPointerLeave={() => setHoveredTopic(null)} data-preview={previewing || undefined}
        style={{ '--slot': indicated, '--compact-column': indicated % 3,
          '--compact-row': Math.floor(indicated / 3), '--topic-tone': topics[indicated].planet.color } as CSSProperties}>
        {topics.map((topic, i) =>
        <button type="button" key={topic.name} aria-controls="topic-articles" aria-pressed={i === topicIndex}
          data-pointed={(hoveredTopic ?? focusedTopic) === i || undefined}
          onPointerEnter={event => {
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') setHoveredTopic(i);
          }}
          onFocus={event => {
            if (event.currentTarget.matches(':focus-visible')) {
              setHoveredTopic(null);
              setFocusedTopic(i);
            }
          }}
          onBlur={() => setFocusedTopic(null)}
          onPointerUp={event => {
            if (event.pointerType === 'touch' && event.isPrimary &&
                event.currentTarget.contains(document.elementFromPoint(event.clientX, event.clientY))) {
              choose(i);
            }
          }}
          onClick={event => {
            // Pointer release handles a tap even directly after a touch scroll.
            if (!(event.nativeEvent instanceof window.PointerEvent) || event.nativeEvent.pointerType !== 'touch' || !event.detail) {
              choose(i);
            }
          }}>
          <span>{topic.name}</span>
        </button>
      )}</div>
      <span className="archive-count">{posts.length} 篇文章</span>
      <p className="archive-note">散落的想法，在这里慢慢连成星座。</p>
    </header>
    <div className="archive-explore">
      <div className="planet-stage" ref={stage} aria-hidden="true" data-preview={previewing || undefined}
        style={{ '--direction': journey.direction, '--nebula-tone': topics[indicated].planet.color } as CSSProperties}>
        <GalaxyField key={`sky-${topicIndex}`} travel={journey.previous !== null} />
        {journey.previous !== null && <TopicPlanet key={journey.previous} index={journey.previous} departing entering={false} />}
        <TopicPlanet key={topicIndex} index={topicIndex} departing={false} entering={journey.previous !== null} />
      </div>
      <Profile />
    </div>
    <div className={'archive-reading' + (pages > 1 ? ' paged' : '')} id="topic-articles">
      <header className="section-heading" aria-live="polite" aria-atomic="true"><h2>{topics[topicIndex].name}</h2>
        <span>{group.length} 篇</span>
      </header>
      {pages > 1 && <OrbitPager page={page} pages={pages} onStep={stepPage} />}
      <ul className="post-list" id="article-page" key={topicIndex}>{group.slice(start, start + pageSize).map((post, index) =>
        <li key={post.slug} onPointerMove={highlightRow} style={{ '--delay': index * 55 + 'ms' } as CSSProperties}>
          <div className="row-meta"><span>{articleTopic(post.slug)}</span><time dateTime={post.date}>{post.listDate ?? post.date}</time></div>
          <h3><a href={'/posts/' + post.slug + '/'}>{post.title}<ArrowUpRight className="row-arrow" size={18} aria-hidden="true" /></a></h3>
          <p>{post.summary}</p>
        </li>
      )}</ul>
    </div>
  </section>;
}
