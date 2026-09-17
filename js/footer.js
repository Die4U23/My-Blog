// 页脚自动生成脚本
(function() {
    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-links">
                <span>Powered by <a href="https://nginx.org/" target="_blank" rel="noopener">Nginx</a> &amp; 古法 HTML/CSS</span>
                <span class="cc-logo">
                    <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="license noopener">
                        <img src="https://licensebuttons.net/l/by-nc/4.0/80x15.png" alt="Creative Commons License">
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
            <div>
                <a class="police-filing" href="https://beian.mps.gov.cn/#/query/webSearch?code=45082102000488" target="_blank" rel="noopener noreferrer">
                    <img src="/images/gongan.png" alt="公安备案图标">
                    <span>桂公网安备45082102000488号</span>
                </a>
            </div>
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
