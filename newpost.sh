#!/bin/bash

#使用方法：./newpost.sh "文章标题" "english-slug"

#检查是否提供标题参数
if [ -z "$1" ] || [ -z "$2" ]; then
	echo "请提供文章标题和英文短名，例如 ./newpost.sh \"位运算工具箱\" \"bitwise-toolbox\""
	exit 1
fi

#获取日期以便命名分类
TITLE="$1"
SLUG="$2"

# 只允许小写英文、数字和单中划线，确保网址简洁且稳定
if ! [[ "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
	echo "英文短名格式错误：只能使用小写英文、数字和单中划线"
	exit 1
fi

DATE=$(date +%Y-%m-%d)
POST_DIR="posts/${SLUG}"
FILENAME="${POST_DIR}/index.html"
POST_URL="/posts/${SLUG}/"

if [ -e "$POST_DIR" ]; then
	echo "短名已存在：${POST_URL}"
	exit 1
fi

mkdir -p "$POST_DIR"
#生成文章HTML文件
cat > "$FILENAME" <<EOF
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script src="/js/theme.js?v=20260818-1"></script>
	<title>主标题</title>
	<script src="/js/highlight.min.js?v=20260818-1"></script>
	<link rel="stylesheet" href="/css/link.css?v=20260818-1">
	<link rel="stylesheet" href="/css/code.css?v=20260818-1">
	<link rel="stylesheet" href="/css/post.css?v=20260818-1">
	<link rel="stylesheet" href="/css/common.css?v=20260818-1">
	<link rel="icon" type="image/x-icon" href="/favicon.ico">
	<script>
            MathJax = {
                tex:{
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']]
                }
            };
        </script>
	<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
	</script>
</head>
<body>
	<div class="navbar">
	    <div class="left-group">
		<a href="/">首页</a>
		<a href="/about/">关于</a>
	    </div>
	    <div class="right-group">
		<a href="https://github.com/Die4U23" target="_blank">Github</a>
	    </div>
	</div>
	<div class="layout">
	    <aside class="post-sidebar">
		<div class="site-info">
		<div id="toc-container"></div>
		</div>
	    </aside>
	    <main class="post-content">
		<article class="post-article">
		    <h1>Main tittle</h1>
		    <p class="post-date">$DATE</p>
		    <div class="content">
			<h2>一级标题</h2>
			<p>文本</p>

			<h3>二级标题</h3>
			<p>测试跳转</p>

			<h4>三级标题</h4>
			<p>测试文本</p>

			<h2>测试标题</h2>
			<p>测试文本</p>
			<h2>公式引入测试</h2>
                        <p>行内公式：$ E = mc^2$</p>
                        <p>块级公式：$$\sum_{i=1}^n i^3 = \left( \frac{n(n+1)}{2} \right)^2$$</p>
		    </div>
		</article>
	    </main>

	    <aside class="post-right">
		<!-- 空置空间 -->
	    </aside>
	</div>
	
	<script>
		hljs.highlightAll();
	</script>
	<script src="/js/footer.js?v=20260819-2"></script>
	<script src="/js/toc.js?v=20260818-1"></script>

</body>
</html>
EOF

echo "已创建：$FILENAME"
echo "访问地址：$POST_URL"

#在index.html博客列表中添加链接

NEW_LINK="	<li> <h3><a href=\"${POST_URL}\">${TITLE}</a></h3><span class=\"date\">${DATE}</span><p>文章简介</p></li>"


#在列表添加新行
if grep -q '<ul class="post-list">' index.html; then
	sed -i "/<ul class=\"post-list\">/a \\${NEW_LINK}" index.html
	echo "已添加链接"
else
	echo"index.html中并未找到 <ul class=\"post-list\">"
fi

