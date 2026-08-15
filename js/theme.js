// 根据访问者的本地时间切换主题，并在顶栏提供手动切换按钮。
(function() {
    const DARK_START_HOUR = 22;
    const LIGHT_START_HOUR = 6;
    const STORAGE_KEY = 'daydreamer-theme';
    const root = document.documentElement;

    function getTimePeriod(date = new Date()) {
        const hour = date.getHours();
        return hour >= DARK_START_HOUR || hour < LIGHT_START_HOUR ? 'night' : 'day';
    }

    function getAutomaticTheme(period) {
        return period === 'night' ? 'dark' : 'light';
    }

    function getStoredTheme(period) {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (stored && stored.period === period && ['light', 'dark'].includes(stored.theme)) {
                return stored.theme;
            }
        } catch (error) {
            // 本地存储不可用或内容损坏时，继续使用自动主题。
        }
        return null;
    }

    function updateThemeColor(theme) {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = theme === 'dark' ? '#111b2e' : '#b8d7ee';
    }

    function updateToggle(button, theme) {
        if (!button) return;

        const isDark = theme === 'dark';
        button.innerHTML = `<span aria-hidden="true">${isDark ? '☀️' : '🌙'}</span>`;
        button.setAttribute('aria-label', isDark ? '切换到日间模式' : '切换到夜间模式');
        button.title = isDark ? '切换到日间模式' : '切换到夜间模式';
        button.setAttribute('aria-pressed', String(isDark));
    }

    let currentPeriod = getTimePeriod();
    let currentTheme = getStoredTheme(currentPeriod) || getAutomaticTheme(currentPeriod);
    let toggleButton = null;

    function applyTheme(theme) {
        currentTheme = theme;
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        updateThemeColor(theme);
        updateToggle(toggleButton, theme);
    }

    function createToggle() {
        const rightGroup = document.querySelector('.navbar .right-group');
        if (!rightGroup || rightGroup.querySelector('.theme-toggle')) return;

        toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'theme-toggle';
        rightGroup.insertBefore(toggleButton, rightGroup.firstChild);
        updateToggle(toggleButton, currentTheme);

        toggleButton.addEventListener('click', function() {
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    theme: nextTheme,
                    period: currentPeriod
                }));
            } catch (error) {
                // 禁用本地存储时，切换在当前页面仍然有效。
            }
        });
    }

    applyTheme(currentTheme);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToggle, { once: true });
    } else {
        createToggle();
    }

    // 页面长时间保持打开时，也会在 06:00 和 22:00 自动更新。
    window.setInterval(function() {
        const nextPeriod = getTimePeriod();
        if (nextPeriod === currentPeriod) return;

        currentPeriod = nextPeriod;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            // 本地存储不可用时无需额外处理。
        }
        applyTheme(getAutomaticTheme(currentPeriod));
    }, 60 * 1000);
})();
