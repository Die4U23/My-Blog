(function() {
    const contentArea = document.querySelector('.post-article .content');
    if (!contentArea) return;

    const headings = contentArea.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) return;

    headings.forEach((heading, idx) => {
        if (!heading.id) {
            let id = heading.textContent.trim()
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '');
            if (!id) id = `heading-${idx}`;
            let finalId = id;
            let counter = 1;
            while (document.getElementById(finalId)) {
                finalId = `${id}-${counter++}`;
            }
            heading.id = finalId;
        }
    });

    let tocHtml = '<ul class="toc-list">';
    let stack = [];

    headings.forEach((heading, index) => {
        const tag = heading.tagName.toLowerCase();
        const level = parseInt(tag[1]);
        const link = `<a href="#${heading.id}" class="toc-link">${escapeHtml(heading.textContent)}</a>`;

        while (stack.length && stack[stack.length - 1] >= level) {
            tocHtml += '</ul></li>';
            stack.pop();
        }
        if (stack.length === 0 || stack[stack.length - 1] < level) {
            tocHtml += `<li class="toc-item-${tag}">${link}`;
            const next = headings[index + 1];
            if (next && parseInt(next.tagName.toLowerCase()[1]) > level) {
                tocHtml += '<ul class="toc-sublist">';
                stack.push(level);
            } else {
                tocHtml += '</li>';
            }
        } else {
            tocHtml += `<li class="toc-item-${tag}">${link}</li>`;
        }
    });
    while (stack.length) {
        tocHtml += '</ul></li>';
        stack.pop();
    }
    tocHtml += '</ul>';

    const tocContainer = document.getElementById('toc-container');
    if (tocContainer) {
        tocContainer.innerHTML = tocHtml;

        const links = tocContainer.querySelectorAll('.toc-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
})();
