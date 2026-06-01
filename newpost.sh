#!/bin/bash

#使用方法：./newpost.sh "文章标题"

#检查是否提供标题参数
if [ -z "$1" ]; then
	echo "请提供文章标题，例如 ./newpost.sh \"文章标题\""
	exit 1
fi

#获取日期以便命名分类
TITLE="$1"
DATE=$(date +%Y-%m-%d)

#生成不带空格符号的文件名
SAFE_TITLE=$(echo "$TITLE" | tr ' ' '_' | tr -d '[:punct:]')
FILENAME="posts/${DATE}-${SAFE_TITLE}.html"

mkdir -p posts

#生成文章HTML文件
cat > "$FILENAME" <<EOF
<!DOCTYPE html>
<html lang="zn-CN">
<head>
	<meta charset="UTF-8">
	<title>${TITLE} - 我的博客</title>
	<link rel="stylesheet" href="/style.css">
</head>
<body>
	<div class="container">
		<a href="/index.html" class="back">返回首页</a>
		<h1>${TITLE}</h1>
		<p class="date">${DATE}</p>
		<div class="content">
			<p>文章内容</p>
		</div>
	</div>
</body>
</html>
EOF

echo "已创建:$FILENAME"

#在index.html博客列表中添加链接

NEW_LINK="	<li><span class=\"date\">${DATE}</span> <a href=\"${FILENAME}\">${TITLE}</a></li>"


#在列表添加新行
if grep -q '<ul class="post-list"> index.html; then
	sed -i "/<ul class=\"post-list\">/a \\${NEW_LINK}" index.html
	echo "已添加链接"
else
	echo"index.html中并未找到 <ul class=\"post-list\">"
fi

