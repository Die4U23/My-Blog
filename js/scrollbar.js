// Keep document scrolling native; draw its indicator inside the page so the
// navbar never joins a separately painted native-scrollbar background.
(function() {
    const root = document.documentElement;
    const body = document.body;
    if (!body || !window.ResizeObserver) return;

    const EDGE_DISTANCE = 24;
    const IDLE_DELAY = 1000;
    const track = document.createElement('div');
    const thumb = document.createElement('div');
    track.className = 'page-scrollbar';
    track.tabIndex = 0;
    track.setAttribute('role', 'scrollbar');
    track.setAttribute('aria-label', '页面滚动条');
    track.setAttribute('aria-orientation', 'vertical');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', '0');
    if (!body.id) body.id = 'page-content';
    track.setAttribute('aria-controls', body.id);
    thumb.className = 'page-scrollbar-thumb';
    track.appendChild(thumb);
    body.appendChild(track);

    let nearEdge = false;
    let dragging = null;
    let scrolling = false;
    let hideTimer;
    let frame = 0;
    let geometry = { maxScroll: 0, travel: 0 };

    function updateVisibility() {
        root.classList.toggle('scrollbar-visible', nearEdge || dragging !== null || scrolling);
    }

    function updateGeometry() {
        frame = 0;
        const scroller = document.scrollingElement;
        const viewportHeight = root.clientHeight;
        const maxScroll = Math.max(0, scroller.scrollHeight - viewportHeight);
        track.hidden = maxScroll <= 0;
        if (track.hidden) return;

        const trackHeight = track.clientHeight;
        const thumbHeight = Math.min(trackHeight, Math.max(32, trackHeight * viewportHeight / scroller.scrollHeight));
        const travel = Math.max(0, trackHeight - thumbHeight);
        // Safari can report negative/past-end positions during a bounce.
        const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${progress * travel}px)`;
        track.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
        geometry = { maxScroll, travel };
    }

    function scheduleGeometry() {
        if (!frame) frame = window.requestAnimationFrame(updateGeometry);
    }

    function revealForScroll() {
        scrolling = true;
        updateVisibility();
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(function() {
            scrolling = false;
            updateVisibility();
        }, IDLE_DELAY);
        scheduleGeometry();
    }

    function isNearEdge(event) {
        return event.pointerType !== 'touch' &&
            event.clientX >= root.clientWidth - EDGE_DISTANCE &&
            event.clientX <= window.innerWidth &&
            event.clientY >= 0 && event.clientY <= window.innerHeight;
    }

    window.addEventListener('scroll', revealForScroll, { passive: true });
    window.addEventListener('resize', scheduleGeometry, { passive: true });
    const resizeObserver = new ResizeObserver(scheduleGeometry);
    resizeObserver.observe(body);

    window.addEventListener('pointermove', function(event) {
        const nextNearEdge = isNearEdge(event);
        if (nearEdge !== nextNearEdge) {
            nearEdge = nextNearEdge;
            updateVisibility();
        }
    }, { passive: true });

    root.addEventListener('pointerleave', function() {
        nearEdge = false;
        updateVisibility();
    }, { passive: true });

    function scrollToPosition(top) {
        window.scrollTo({ top: Math.min(geometry.maxScroll, Math.max(0, top)), behavior: 'instant' });
    }

    track.addEventListener('pointerdown', function(event) {
        if (event.button !== 0) return;
        updateGeometry();
        if (track.hidden || geometry.travel <= 0) return;
        event.preventDefault();
        track.focus({ preventScroll: true });
        track.setPointerCapture(event.pointerId);

        if (event.target !== thumb) {
            const localY = event.clientY - track.getBoundingClientRect().top - thumb.clientHeight / 2;
            scrollToPosition(localY / geometry.travel * geometry.maxScroll);
        }
        dragging = {
            pointerId: event.pointerId,
            startY: event.clientY,
            startScroll: Math.min(geometry.maxScroll, Math.max(0, window.scrollY))
        };
        track.classList.add('is-dragging');
        updateVisibility();
    });

    track.addEventListener('pointermove', function(event) {
        if (!dragging || event.pointerId !== dragging.pointerId || geometry.travel <= 0) return;
        scrollToPosition(dragging.startScroll + (event.clientY - dragging.startY) / geometry.travel * geometry.maxScroll);
    });

    function endDrag(event) {
        if (!dragging || (event.pointerId !== undefined && event.pointerId !== dragging.pointerId)) return;
        const pointerId = dragging.pointerId;
        dragging = null;
        track.classList.remove('is-dragging');
        if (track.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
        updateVisibility();
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('lostpointercapture', endDrag);

    track.addEventListener('keydown', function(event) {
        updateGeometry();
        const step = root.clientHeight * 0.9;
        const positions = {
            ArrowDown: window.scrollY + 40,
            ArrowUp: window.scrollY - 40,
            PageDown: window.scrollY + step,
            PageUp: window.scrollY - step,
            Home: 0,
            End: geometry.maxScroll
        };
        if (!(event.key in positions)) return;
        event.preventDefault();
        scrollToPosition(positions[event.key]);
    });

    window.addEventListener('blur', function() {
        endDrag({});
        window.clearTimeout(hideTimer);
        nearEdge = scrolling = false;
        updateVisibility();
    });

    // Enable only after the replacement is ready; no script means native UI.
    root.classList.add('scrollbar-auto');
    updateGeometry();
})();
