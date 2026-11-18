import { renderToString } from 'react-dom/server';
import { StarHero } from './StarHero';
import { ArticleExplorer } from './ArticleExplorer';

function Navigation({ section }) {
  return <header className={section === 'home' ? 'navbar sky-nav' : 'navbar'}><nav className="nav-inner" aria-label="主导航">
    <a className="wordmark" href="/"><span className="moon-mark" aria-hidden="true" />Daydreamer</a>
    <div className="nav-links">
      <a href="/" aria-current={section === 'home' ? 'page' : undefined}>首页</a>
      <a href="/about/" aria-current={section === 'about' ? 'page' : undefined}>关于</a>
      <a href="https://github.com/Die4U23" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      <span id="theme-control" />
    </div>
  </nav></header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner wrap">
      <p className="footer-note">这一页写到这里，探索还在继续。</p>
      <div>
        <p className="footer-owner">© 2026 Daydreamer.</p>
        <div className="footer-links">
          <span>Powered by <a href="https://nginx.org/" target="_blank" rel="noopener">Nginx</a> &amp; React</span>
          <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="license noopener">CC BY-NC 4.0</a>
        </div>
      </div>
      <div className="footer-records">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">桂ICP备2026018300号</a>
        <a className="police-filing" href="https://beian.mps.gov.cn/#/query/webSearch?code=45082102000488" target="_blank" rel="noopener noreferrer">
          <img src="/images/gongan.png" width="36" height="40" alt="" /><span>桂公网安备45082102000488号</span>
        </a>
      </div>
    </div>
  </footer>;
}

function Home({ posts }) {
  const listed = posts.filter(post => post.summary).map(post => ({
    slug: post.slug, title: post.listTitle ?? post.title, date: post.date.slice(0, 10),
    listDate: post.listDate, summary: post.summary,
  }));
  return <main className="home">
    <div id="sky-root"><StarHero /></div>
    <div id="explorer-root"><ArticleExplorer posts={listed} /></div>
    <script id="archive-data" type="application/json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(listed).replaceAll('<', '\\u003c'),
    }} />
    <noscript><nav className="wrap" aria-label="全部文章"><h2>全部文章</h2><ul>{listed.map(post =>
      <li key={post.slug}><a href={`/posts/${post.slug}/`}>{post.title}</a></li>
    )}</ul></nav></noscript>
  </main>;
}

function About() {
  return <main className="board wrap">
    <div className="about-intro">
      <img className="avatar" src="/images/img1.jpg" alt="Daydreamer 的头像" width="88" height="88" />
      <h1>关于 Daydreamer</h1>
      <p>因为太多原因让我不想使用主流社交媒体，在这里记录一下学习生活日常。</p>
      <p className="about-note">有些问题还没有答案，先把探索的过程留在这里。</p>
      <a className="author-email" href="mailto:Daydreamer@sjtu.edu.cn">Daydreamer@sjtu.edu.cn</a>
    </div>
  </main>;
}

function Article({ post }) {
  return <div className="layout wrap">
    <aside className="post-sidebar"><nav id="toc-container" aria-label="文章目录" /></aside>
    <main className="post-content">
      <article className="post-article">
        <a className="back-link" href="/#articles">← 文章列表</a>
        <h1>{post.title}</h1>
        <p className="post-date">{post.date.slice(0, 10)}{post.dateNote && ` · ${post.dateNote}`}</p>
        <div className="content" dangerouslySetInnerHTML={{ __html: post.body }} />
      </article>
    </main>
  </div>;
}

function MathScripts({ delimiter }) {
  const tex = {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [[delimiter, delimiter], ['\\[', '\\]']],
  };
  return <>
    <script dangerouslySetInnerHTML={{ __html: 'window.MathJax=' + JSON.stringify({ tex }).replaceAll('<', '\\u003c') }} />
    <script id="MathJax-script" defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" />
  </>;
}

function Page({ title, description, section, styles, assets, post, children }) {
  return <html lang="zh-CN">
    <head>
      <meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta name="theme-color" content="#e9e9e3" />
      <script dangerouslySetInnerHTML={{ __html: assets.themeScript }} />
      <link rel="icon" type="image/x-icon" href="/favicon-moon.ico?v=20261027-3" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-moon-32.png?v=20261027-3" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-moon.png?v=20261027-3" />
      {styles.map(name => <link key={name} rel="stylesheet" href={assets[name]} />)}
      <script type="module" src={assets.scrollbar} /><script type="module" src={assets.client} />
      {section === 'home' && <script type="module" src={assets['sky-entry']} />}
      {post?.mathDelimiter && <MathScripts delimiter={post.mathDelimiter} />}
    </head>
    <body>
      <Navigation section={section} />{children}<Footer />
      {post?.body.includes('<pre') && <>
        <script src="/js/highlight.min.js?v=20260819-3" /><script dangerouslySetInnerHTML={{ __html: 'hljs.highlightAll();' }} />
      </>}
    </body>
  </html>;
}

export function* pages(posts, assets, requested) {
  function render(props, children) {
    return '<!DOCTYPE html>\n' + renderToString(<Page {...props} assets={assets}>{children}</Page>) + '\n';
  }
  if (!requested || requested === 'index.html') {
    yield ['index.html', render({ section: 'home', title: "Daydreamer's Blog", styles: ['common', 'index'] }, <Home posts={posts} />)];
  }
  if (!requested || requested === 'about/index.html') {
    yield ['about/index.html', render({ section: 'about', title: '关于', styles: ['common', 'board'] }, <About />)];
  }
  for (const post of posts) {
    const file = `posts/${post.slug}/index.html`;
    if (requested && requested !== file) continue;
    yield [file, render({
      title: post.pageTitle ?? post.title,
      description: post.description,
      styles: ['link', 'code', 'post', 'common'],
      post,
    }, <Article post={post} />)];
  }
}
