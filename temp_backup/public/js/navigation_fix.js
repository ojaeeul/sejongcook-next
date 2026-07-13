/**
 * Navigation Fix Script
 * Ensures that clicking on board links works reliably by handling navigation 
 * at the capture phase, preventing other scripts from blocking it.
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log("Navigation Fix Script Loaded");

    // Helper to force navigation
    function forceNavigate(e) {
        var href = this.getAttribute('href');
        if (href && href !== '#' && href.indexOf('javascript') === -1) {
            console.log("Force navigating to:", href);
            e.stopPropagation(); // Stop bubbling to conflicting handlers
            e.preventDefault(); // Prevent default just in case, since we handle it manually
            window.location.href = href; // Force navigation
        }
    }

    // 1. Fix Depth 2 Links (Sub-items) - specific board pages
    // These should ALWAYS navigate, never toggle.
    var subLinks = document.querySelectorAll('.dep2 a');
    subLinks.forEach(function (link) {
        // Use Capture Phase (true) to run before bubbling handlers
        link.addEventListener('click', forceNavigate, true);
    });

    // 2. Fix Quick Links (Card Grid) and Latest Updates (More +)
    // These are standard links that shouldn't be blocked, but just in case.
    var quickLinks = document.querySelectorAll('.info-card, .more-link');
    quickLinks.forEach(function (link) {
        link.addEventListener('click', forceNavigate, true);
    });

    // 3. Fix Depth 1 Links (Top-level) - ONLY on Desktop
    // On mobile, they might be needed for toggling.
    // But if user clicks and expects navigation, maybe we should enforce it if screen is wide.
    var topLinks = document.querySelectorAll('.dep1 > li > a');
    topLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            // Check width directly here
            if (window.innerWidth > 1023) {
                forceNavigate.call(this, e);
            }
        }, true);
    });

    // 4. Global fallback for 'bbs/' links
    var boardLinks = document.querySelectorAll('a[href*="bbs/"], a[href*="page/"]');
    boardLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            // Only apply if it's not a top-level mobile toggle
            var isMobileToggle = window.innerWidth <= 1023 && link.nextElementSibling && link.nextElementSibling.classList.contains('dep2');
            if (!isMobileToggle) {
                forceNavigate.call(this, e);
            }
        }, true);
    });
});
