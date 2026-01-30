/**
 * PageManager
 * Handles static page content management using LocalStorage.
 * Allows overriding hardcoded HTML with dynamic content.
 */
var PageManager = (function () {
    var STORAGE_KEY = 'sejongcook_page_content';

    function loadPages() {
        var data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    function savePages(pages) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    }

    return {
        /**
         * Get content for a specific page ID
         * @param {string} pageId e.g. 'sub0101'
         * @returns {string|null} HTML content or null
         */
        getPage: function (pageId) {
            var pages = loadPages();
            return pages[pageId] || null;
        },

        /**
         * Save content for a page
         * @param {string} pageId 
         * @param {string} content HTML content
         */
        savePage: function (pageId, content) {
            var pages = loadPages();
            pages[pageId] = content;
            savePages(pages);
            return { success: true, message: '페이지가 저장되었습니다.' };
        },

        /**
         * Check if page has custom content
         */
        hasCustomContent: function (pageId) {
            var pages = loadPages();
            return !!pages[pageId];
        },

        /**
         * Reset page to original (delete custom content)
         */
        resetPage: function (pageId) {
            var pages = loadPages();
            delete pages[pageId];
            savePages(pages);
            return { success: true, message: '페이지가 초기화되었습니다.' };
        }
    };
})();
