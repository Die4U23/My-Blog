// 页脚自动生成脚本
(function() {
    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-links">
                <span>Powered by <a href="https://nginx.org/" target="_blank" rel="noopener">Nginx</a> &amp; 古法 HTML/CSS</span>
                <span class="cc-logo">
                    <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="license noopener">
                        <img src="https://licensebuttons.net/l/by-nc/4.0/80x15.png" alt="Creative Commons License" style="height: 1em; display: inline-block; vertical-align: middle; padding-bottom: 3px;">
                        CC BY-NC
                    </a>
                </span>
            </div>
            <div>
                © 2026 Daydreamer.
            </div>
            <div>
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">桂ICP备2026018300号</a>
            </div>
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
