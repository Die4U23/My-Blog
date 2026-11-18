# Daydreamer's Blog

博客使用 React 18 和 Vite，星空首屏使用 TypeScript、Tailwind CSS 和 lucide-react。构建时为首页、关于页和每篇文章生成完整 HTML，Nginx 可以直接提供构建产物。

## 本地预览

在仓库根目录运行以下命令（Node.js 22.12 或更新版本）。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址（默认 http://127.0.0.1:5173/ ）。Vite 开发服务会加载当前源码；使用 `npm run build` 和 `npm run preview` 可检查部署版本。

## 写文章

```sh
node scripts/newpost.mjs "文章标题" "english-slug"
```

也可以沿用 `./newpost.sh "文章标题" "english-slug"`。编辑 `content/posts/<slug>/body.html` 写正文，在同目录的 `meta.json` 填写标题、日期和首页摘要。带有 `summary` 的文章会进入首页，所有文章都可以通过 `/posts/<slug>/` 访问。

正文中的二至四级标题会进入目录，已有的标题 ID 可继续用于分享章节链接。公式文章可在元数据中设置 `"mathDelimiter": "$$"` 启用 MathJax，代码块可使用 `<pre><code class="language-cpp">`。

## 构建与部署

```sh
npm ci
npm run build
```

将 `dist/` 的内容发布到 Nginx 站点根目录。公共页面组件位于 `src/pages.jsx`，交互组件位于 `src/client.jsx`。历史链接重定向和 HTML 缓存检查见[部署说明](docs/html-cache-deployment.md)。

首页的文章星球复用首页收录的文章。精选和四个主题的示例分组在 `src/archiveTopics.ts`，可按文章目录名（slug）调整归属。新增带摘要的文章会自动进入「全部文章」，把 slug 加入主题即可在对应的主题星球显示。六个主题分别使用土星、地球、木星、火星、水星和海王星的本地纹理，经球面投影和着色，土星另配示意星环。[Solar System Scope](https://www.solarsystemscope.com/textures/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。

日间首屏展示哈勃拍摄的 M8 礁湖星云。背景为红外影像，移动鼠标可查看同一处的可见光细节。触屏设备和启用「减少动态」的浏览器展示静态星图。图片署名为 NASA、ESA、STScI。[ESA/Hubble 双波段对照](https://esahubble.org/images/comparisons/heic1808a/)

夜间首屏展示 M16 创生之柱的近红外和中红外影像。两幅图已按星点对齐并裁切。图片署名为 NASA、ESA、CSA、STScI，图像处理为 Joseph DePasquale、Alyssa Pagan 和 Anton Koekemoer。[NIRCam 原图](https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/) · [MIRI 原图](https://science.nasa.gov/asset/webb/pillars-of-creation-miri-image/)
