// Reveal the native page scrollbar on scroll or when the pointer nears it.
(function() {
    const root = document.documentElement;
    const EDGE_DISTANCE = 24;
    const IDLE_DELAY = 1000;
    let nearEdge = false;
    let dragging = false;
    let scrolling = false;
    let hideTimer;

    function updateVisibility() {
        root.classList.toggle('scrollbar-visible', nearEdge || dragging || scrolling);
    }

    function isNearEdge(event) {
        return event.pointerType !== 'touch' &&
            event.clientX >= root.clientWidth - EDGE_DISTANCE;
    }

    function onScroll() {
        scrolling = true;
        updateVisibility();
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(function() {
            scrolling = false;
            updateVisibility();
        }, IDLE_DELAY);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', function(event) {
        const nextNearEdge = isNearEdge(event);
        if (nearEdge === nextNearEdge) return;
        nearEdge = nextNearEdge;
        updateVisibility();
    }, { passive: true });

    window.addEventListener('pointerdown', function(event) {
        nearEdge = isNearEdge(event);
        dragging = nearEdge && event.button === 0;
        updateVisibility();
    }, { passive: true });

    function endDrag(event) {
        dragging = false;
        nearEdge = event.type === 'pointerup' && isNearEdge(event);
        updateVisibility();
    }

    window.addEventListener('pointerup', endDrag, { passive: true });
    window.addEventListener('pointercancel', endDrag, { passive: true });
    document.documentElement.addEventListener('pointerleave', function() {
        nearEdge = false;
        updateVisibility();
    }, { passive: true });

    window.addEventListener('blur', function() {
        window.clearTimeout(hideTimer);
        nearEdge = dragging = scrolling = false;
        updateVisibility();
    });

    root.classList.add('scrollbar-auto');
})();
