# HTML 自动检查更新

HTML 返回 `Cache-Control: no-cache, must-revalidate`，保留 ETag 和
Last-Modified。浏览器正常访问时验证缓存，未修改返回 304，修改后返回新页面。
图标、CSS 和 JavaScript 继续通过版本化 URL 区分内容。

## 应用到线上 Nginx

仅拉取 Git 提交不会启用 Nginx 配置。部署人员需检查 `sudo nginx -T` 中
`server_name mengsblog.top` 对应的 HTTPS server 块：

1. 备份实际生效的站点配置，在该 server 块内 include 本仓库
   `nginx-cache.conf` 的服务器绝对路径，放在其他正则 location 之前。
2. 若已有 `location = /`，合并其首页处理与缓存规则，不得重复定义。
   检查已有 `^~` location 是否阻止文章目录进入 HTML 规则，以及已有
   location 内的 `add_header` 是否覆盖了继承的响应头。保留站点现有 TLS、
   安全响应头、日志及其他服务配置。
3. 运行 `sudo nginx -t`，通过后再执行 `sudo systemctl reload nginx`。
4. 在仓库目录执行：

   ```sh
   python3 scripts/check-html-cache.py https://mengsblog.top
   ```

必须全部页面通过后才能标记线上完成。脚本检查首页、关于页和全部文章的
200 响应、ETag / Last-Modified 条件请求的 304 响应，以及过期 ETag 返回新正文。
配置未生效时脚本退出非零，不以 Git 合并成功代替部署成功。

## 生效边界

此策略适用于后续正常导航请求，不会强制刷新正在阅读的页面，也不能从服务器
主动撤销浏览器已经持有、仍被认为新鲜的历史响应。新规则会在下一次网络请求后
被浏览器获得；无需给访客提供带版本号的首页链接作为长期访问方式。

Nginx 文档：
[响应头配置](https://nginx.org/en/docs/http/ngx_http_headers_module.html)、
[条件请求](https://nginx.org/en/docs/http/ngx_http_core_module.html#if_modified_since)。
