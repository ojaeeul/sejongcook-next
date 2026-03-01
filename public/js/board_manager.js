/**
 * BoardManager
 * Handles board posts management using IndexedDB (async) to support large capacity (10,000+ posts).
 */
var BoardManager = (function () {
    var DB_NAME = 'sejongcook_db';
    var DB_VERSION = 1;
    var STORE_NAME = 'board_posts';
    var db = null;

    // Open Database
    function openDB() {
        return new Promise(function (resolve, reject) {
            if (db) {
                resolve(db);
                return;
            }
            var request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {
                var database = event.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    // Create object store with 'idx' as key path
                    database.createObjectStore(STORE_NAME, { keyPath: 'idx' });
                }
            };

            request.onsuccess = function (event) {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = function (event) {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };
        });
    }



    /**
     * Board Configuration Management (LocalStorage)
     */
    var CONFIG_KEY = 'sejongcook_admin_board_configs_v2'; // Version bumped to force strict permissions

    function loadConfigs() {
        var data = localStorage.getItem(CONFIG_KEY);
        if (!data) {
            // Default Initial Boards
            var defaults = [
                { code: 'sub0601', name: '공지사항 (Notice)', type: 'list', writeLevel: 9, category: 'main' },
                { code: 'sub0602', name: '질문 & 답변 (Q&A)', type: 'list', writeLevel: 0, category: 'main' },
                { code: 'sub0501', name: '구인정보 (Jobs)', type: 'list', writeLevel: 9, category: 'main' }, // Changed to Admin Only (9)
                { code: 'sub0502', name: '구직정보 (Job Seek)', type: 'list', writeLevel: 9, category: 'main' }, // Changed to Admin Only (9)
                { code: 'inquiry_sub0701', name: '상담 신청 (Inquiry)', type: 'list', writeLevel: 0, category: 'main' }
                // Legacy mapping if needed, or just new ones
            ];
            localStorage.setItem(CONFIG_KEY, JSON.stringify(defaults));
            return defaults;
        }
        return JSON.parse(data);
    }

    function saveConfigs(configs) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(configs));
    }

    /**
     * Seed Default Posts if DB is empty
     */
    function seedDefaultPosts(database) {
        return new Promise(function (resolve, reject) {
            var transaction = database.transaction([STORE_NAME], 'readonly');
            var store = transaction.objectStore(STORE_NAME);
            var countRequest = store.count();

            countRequest.onsuccess = function () {
                if (countRequest.result === 0) {
                    // DB is empty, seed data
                    var tx = database.transaction([STORE_NAME], 'readwrite');
                    var st = tx.objectStore(STORE_NAME);

                    var initialPosts = [
                        // Notice (sub0601) - Scraped from Live Site
                        {
                            boardCode: 'sub0601',
                            subject: '2024년도 1기 브런치반모집',
                            authorName: '관리자',
                            date: '2024-01-15',
                            timestamp: Date.now(),
                            hit: 154,
                            content: '2024년도 1기 브런치반 모집 공고입니다.'
                        },
                        {
                            boardCode: 'sub0601',
                            subject: '2024년도 상시시험일정',
                            authorName: '관리자',
                            date: '2024-01-02',
                            timestamp: Date.now() - 86400000,
                            hit: 89,
                            content: '2024년도 조리기능사 상시시험 일정입니다.'
                        },
                        {
                            boardCode: 'sub0601',
                            subject: '2023년도 상시 시험일정',
                            authorName: '관리자',
                            date: '2023-01-05',
                            timestamp: Date.now() - 31536000000,
                            hit: 120,
                            content: '2023년도 상시 시험 일정 안내.'
                        },
                        {
                            boardCode: 'sub0601',
                            subject: '2022년도 여름방학 특강( 케이크 데코)개강',
                            authorName: '관리자',
                            date: '2022-06-20',
                            timestamp: Date.now() - 40000000000,
                            hit: 95,
                            content: '여름방학 맞이 케이크 데코 특강 개강합니다.'
                        },
                        {
                            boardCode: 'sub0601',
                            subject: '브런치요리 특강반 개강',
                            authorName: '원장',
                            date: '2021-03-23',
                            timestamp: Date.now() - 80000000000,
                            hit: 1960,
                            content: '브런치 요리 특강반을 개강합니다.'
                        },

                        // Q&A (sub0602) - Kept Dummy
                        {
                            boardCode: 'sub0602',
                            subject: '국비지원 과정 수강 자격 문의',
                            authorName: '김철수',
                            date: '2026-01-11',
                            timestamp: Date.now(),
                            hit: 12,
                            content: '내일배움카드로 수강 가능한지 궁금합니다.'
                        },
                        {
                            boardCode: 'sub0602',
                            subject: '주말 반 수업 시간 문의',
                            authorName: '이영희',
                            date: '2026-01-09',
                            timestamp: Date.now() - 172800000,
                            hit: 25,
                            content: '직장인이라 주말반 수업 시간이 어떻게 되는지 알고 싶습니다.'
                        },

                        // Jobs (sub0501) - Scraped from Live Site
                        {
                            boardCode: 'sub0501',
                            subject: '구내식당 직원 구인합니다.',
                            authorName: '김민준',
                            date: '2023-05-22',
                            timestamp: Date.now(),
                            hit: 837,
                            content: '구내식당에서 근무할 직원을 구합니다.'
                        },
                        {
                            boardCode: 'sub0501',
                            subject: '파파존스 김포점에서 정직원 매니저 구인합니다.',
                            authorName: '파파존스김포',
                            date: '2022-09-14',
                            timestamp: Date.now() - 259200000,
                            hit: 1506,
                            content: '파파존스 김포점 매니저 채용 공고'
                        },
                        {
                            boardCode: 'sub0501',
                            subject: '김포경희25병원 조리사 채용 공고',
                            authorName: '경희25병원',
                            date: '2022-06-29',
                            timestamp: Date.now() - 500000000,
                            hit: 2035,
                            content: '병원 조리사 채용합니다.'
                        },
                        {
                            boardCode: 'sub0501',
                            subject: '블랑제리115 장기점 및 고촌점 생산 및 판매직원 모집',
                            authorName: '블랑제리115',
                            date: '2022-04-12',
                            timestamp: Date.now() - 600000000,
                            hit: 1797,
                            content: '블랑제리115 직원 모집합니다.'
                        },
                        {
                            boardCode: 'sub0501',
                            subject: '[인크루트 채용공고] 삼성물산 에버랜드 리조트 조리사',
                            authorName: '인크루트',
                            date: '2022-04-01',
                            timestamp: Date.now() - 700000000,
                            hit: 500,
                            content: '에버랜드 리조트 조리사 모집 채용공고'
                        }
                    ];

                    initialPosts.forEach(function (post) {
                        // Generate ID similar to addPost
                        post.idx = 'local_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                        post.commentCount = 0;
                        st.add(post);
                    });

                    tx.oncomplete = function () {
                        console.log("BoardManager: Seeded default posts.");
                        resolve();
                    };
                } else {
                    resolve();
                }
            };
            countRequest.onerror = function () {
                resolve(); // Ignore error and proceed
            };
        });
    }

    var initPromise = null;

    return {
        /**
         * Initialize storage
         */
        init: function () {
            if (!initPromise) {
                initPromise = openDB().then(function (db) {
                    console.log("BoardManager: IndexedDB initialized.");

                    // [FEATURE] Sync from Static JS Data if available
                    if (window.STATIC_BOARD_DATA) {
                        console.log("BoardManager: Found STATIC_BOARD_DATA. Syncing...", window.STATIC_BOARD_DATA);
                        var tx = db.transaction([STORE_NAME], 'readwrite');
                        var store = tx.objectStore(STORE_NAME);

                        // Loop through all boards in the static data
                        Object.keys(window.STATIC_BOARD_DATA).forEach(function (bCode) {
                            var staticPosts = window.STATIC_BOARD_DATA[bCode];
                            staticPosts.forEach(function (sp) {
                                // Assign an internal ID if not present (though python gives filename, we can use that as key?)
                                // The python script returns 'file': '...'
                                // We can use 'sub0601/filename' as unique idx?
                                // Existing IndexedDB uses 'local_...' or whatever.
                                // Let's try to map it.

                                var uniqueId = "static_" + sp.file; // e.g. static_20260115_...html

                                var newObj = {
                                    idx: uniqueId,
                                    boardCode: bCode,
                                    subject: sp.title,
                                    authorName: sp.author,
                                    date: sp.date,
                                    timestamp: new Date(sp.date).getTime(), // Estimate timestamp from date
                                    hit: sp.hit || 0,
                                    content: "Detailed content in file: " + sp.file, // Placeholder
                                    linkFile: sp.file // Store the filename to link to
                                };

                                store.put(newObj); // Create or Update
                            });
                        });

                        return new Promise(function (res) {
                            tx.oncomplete = function () {
                                console.log("BoardManager: Static sync complete.");
                                res(db);
                            };
                        });
                    }

                    return seedDefaultPosts(db);
                }).catch(function (err) {
                    console.error("BoardManager: Failed to init DB", err);
                });
            }
            return initPromise;
        },

        /**
         * Wait for initialization to complete
         */
        ready: function () {
            return this.init();
        },

        // --- Config Management ---
        getConfigs: function () {
            return loadConfigs();
        },

        addConfig: function (config) {
            var configs = loadConfigs();
            if (configs.some(function (c) { return c.code === config.code; })) {
                return { success: false, message: '이미 존재하는 ID입니다.' };
            }
            configs.push(config);
            saveConfigs(configs);
            return { success: true, message: '게시판이 추가되었습니다.' };
        },

        updateConfig: function (config) {
            var configs = loadConfigs();
            var index = configs.findIndex(function (c) { return c.code === config.code; });
            if (index !== -1) {
                configs[index] = config;
                saveConfigs(configs);
                return { success: true, message: '수정되었습니다.' };
            }
            return { success: false, message: '대상을 찾을 수 없습니다.' };
        },

        deleteConfig: function (code) {
            var configs = loadConfigs();
            var newConfigs = configs.filter(function (c) { return c.code !== code; });
            saveConfigs(newConfigs);
            return { success: true, message: '삭제되었습니다.' };
        },

        /**
         * Get all posts for a specific board (or all if not specified)
         * @param {string} boardCode Optional board code filter
         * @returns {Promise<Array>} List of posts
         */
        getPosts: function (boardCode) {
            // [FEATURE] STATIC DATA FIRST STRATEGY
            // If we have static data generated by Python, use it directly.
            // This bypasses IndexedDB complexity/caching issues for the main list.
            if (window.STATIC_BOARD_DATA && window.STATIC_BOARD_DATA[boardCode]) {
                return new Promise(function (resolve) {
                    var posts = window.STATIC_BOARD_DATA[boardCode] || [];
                    // Ensure sorting
                    posts.sort(function (a, b) {
                        // Sort by numeric hit/id or date? Usually Date desc.
                        // The Python script already writes them sorted, but let's be safe.
                        var dateA = a.date ? new Date(a.date) : new Date(0);
                        var dateB = b.date ? new Date(b.date) : new Date(0);
                        return dateB - dateA;
                    });
                    console.log("BoardManager: Serving " + posts.length + " posts from STATIC DATA.");
                    resolve(posts);
                });
            }

            return openDB().then(function (database) {
                return new Promise(function (resolve, reject) {
                    var transaction = database.transaction([STORE_NAME], 'readonly');
                    var store = transaction.objectStore(STORE_NAME);
                    var request = store.getAll();

                    request.onsuccess = function () {
                        var posts = request.result || [];
                        // Sort by timestamp (newest first)
                        posts.sort(function (a, b) {
                            var tA = a.timestamp;
                            var tB = b.timestamp;


                            // If one is missing timestamp (legacy), try to parse from idx
                            if (!tA && a.idx && a.idx.indexOf('local_') === 0) {
                                tA = parseInt(a.idx.split('_')[1]) || 0;
                            }
                            if (!tB && b.idx && b.idx.indexOf('local_') === 0) {
                                tB = parseInt(b.idx.split('_')[1]) || 0;
                            }

                            if (tA && tB) {
                                return tB - tA;
                            }

                            // Fallback to date string comparisons
                            if (a.date > b.date) return -1;
                            if (a.date < b.date) return 1;
                            return 0;
                        });

                        if (boardCode && boardCode !== 'all') {
                            posts = posts.filter(function (p) { return p.boardCode === boardCode; });
                        }
                        resolve(posts);
                    };

                    request.onerror = function () {
                        // Resolve empty instead of rejecting to allow fallback
                        console.warn("BoardManager: Failed to get posts, using fallback.", request.error);
                        resolve([]);
                    };
                });
            }).catch(function (err) {
                // Catch openDB errors
                console.warn("BoardManager: DB open failed, using fallback.", err);
                return [];
            });
        },

        /**
         * Get a single post
         */
        getPost: function (boardCode, idx) {
            // [FEATURE] STATIC DATA FIRST
            if (window.STATIC_BOARD_DATA && window.STATIC_BOARD_DATA[boardCode]) {
                var posts = window.STATIC_BOARD_DATA[boardCode];
                var post = posts.find(function (p) { return p.idx == idx; }); // Loose equality for string/int mix
                if (post) {
                    // Check if content is missing or needs fetching (for static files)
                    if ((!post.content || post.content.indexOf('Detailed content') > -1) && post.file) {
                        // Fetch the actual file content
                        // Construct path: current page is root(?), so bbs/boardCode/filename
                        // But BoardUI might be running from / or /bbs/ ?
                        // Safest is relative to root if we assume root context, but fetches are relative to page.
                        // Assuming we are on a page like /bbs/sub0601.html or /main.html
                        // Let's try to detect path.

                        var fetchPath = 'bbs/' + boardCode + '/' + post.file;
                        // If we are ALREADY in bbs/, then just boardCode + '/' + post.file ?
                        // No, if we are in bbs/sub0601.html, we are in bbs/.
                        // So sub0601/152736.html is correct relative path?
                        // Let's check location.pathname
                        if (location.pathname.indexOf('/bbs/') > -1) {
                            fetchPath = boardCode + '/' + post.file;
                        }

                        return fetch(fetchPath)
                            .then(function (res) {
                                if (!res.ok) throw new Error("Failed to fetch");
                                return res.text();
                            })
                            .then(function (html) {
                                // Extract content from #conbody
                                var parser = new DOMParser();
                                var doc = parser.parseFromString(html, 'text/html');
                                var conbody = doc.getElementById('conbody');
                                if (conbody) {
                                    post.content = conbody.innerHTML;
                                } else {
                                    post.content = html; // Fallback
                                }
                                return post;
                            })
                            .catch(function (err) {
                                console.error("Error fetching static post content:", err);
                                post.content = "<p>내용을 불러올 수 없습니다. (" + err.message + ")</p>";
                                return post;
                            });
                    }
                    return Promise.resolve(post);
                }
            }

            return openDB().then(function (database) {
                return new Promise(function (resolve, reject) {
                    var transaction = database.transaction([STORE_NAME], 'readonly');
                    var store = transaction.objectStore(STORE_NAME);
                    // If idx is string (static_...), we need to ensure key type matches. 
                    // Store keyPath is 'idx'
                    var request = store.get(idx);

                    request.onsuccess = function () {
                        resolve(request.result);
                    };

                    request.onerror = function () {
                        resolve(null);
                    };
                });
            });
        },

        /**
         * Save file to server via PHP
         */
        saveFileToServer: function (path, content) {
            // Determine API path based on current location
            // Use unified API path that works for both Local Node and Live PHP
            var apiPath = '/api/index.php?save_post';

            // Adjust relative path if we are deeper in the directory structure (e.g. inside bbs/)
            // Actually, /api/... is absolute from root, so it's safer than relative.
            if (location.pathname.indexOf('/bbs/') > -1 || location.pathname.indexOf('/page/') > -1) {
                // On some setups, absolute path might be safer.
                // let's try absolute '/api/index.php'
            }

            return fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path, content: content })
            }).then(function (res) {
                return res.json();
            });
        },

        /**
         * Add a new post
         */
        addPost: function (postObj) {
            var self = this;
            return openDB().then(function (database) {
                return new Promise(function (resolve, reject) {
                    var now = Date.now();
                    // If no IDX (new post), generate filename-based IDX
                    if (!postObj.idx) {
                        var rand = Math.floor(Math.random() * 10000);
                        // Format: YYYYMMDD_HHMMSS_RAND.html
                        var dateStr = new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14);
                        var filename = dateStr + '_' + rand + '.html';
                        postObj.idx = filename;
                        postObj.file = filename; // For static link
                    }

                    postObj.date = new Date().toISOString().split('T')[0];
                    postObj.timestamp = now;
                    postObj.hit = 0;

                    // 1. Save to IndexedDB (Local Cache)
                    var transaction = database.transaction([STORE_NAME], 'readwrite');
                    var store = transaction.objectStore(STORE_NAME);
                    store.put(postObj);

                    // 2. Save to Server (PHP)
                    // Construct HTML Content
                    var htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${postObj.subject}</title>
    <!-- Include template styles if needed -->
</head>
<body>
    <div id="conbody">${postObj.content}</div>
</body>
</html>`;
                    // Board path: bbs/boardCode/filename
                    var filePath = 'bbs/' + postObj.boardCode + '/' + postObj.idx;

                    self.saveFileToServer(filePath, htmlContent).then(function (res) {
                        if (res.success) {
                            console.log("Server save success");
                        } else {
                            console.warn("Server save failed", res);
                        }
                    });

                    // Also update board_data if we want true static sync (Advanced)
                    // For now, relying on 'file existence' for list generation might be hard without re-scanning.
                    // But we can update 'js/content_data.js' via PHP!
                    // ... (omitted for safety, might corrupt large file)

                    resolve({ success: true, message: '게시글이 등록되었습니다. (실시간 저장)' });
                });
            });
        },

        /**
         * Update a post
         */
        updatePost: function (postObj) {
            var self = this;
            return openDB().then(function (database) {
                return new Promise(function (resolve, reject) {
                    var transaction = database.transaction([STORE_NAME], 'readwrite');
                    var store = transaction.objectStore(STORE_NAME);
                    var request = store.put(postObj);

                    request.onsuccess = function () {
                        // Update Server File
                        var htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${postObj.subject}</title>
</head>
<body>
    <div id="conbody">${postObj.content}</div>
</body>
</html>`;
                        var filePath = 'bbs/' + postObj.boardCode + '/' + postObj.idx;
                        // Check if idx ends with .html, if not append
                        if (postObj.idx.indexOf('.html') === -1) filePath += '.html';

                        self.saveFileToServer(filePath, htmlContent).then(function (res) {
                            resolve({ success: true, message: '수정되었습니다. (서버 반영)' });
                        });
                    };

                    request.onerror = function () {
                        resolve({ success: false, message: '수정 실패: ' + request.error });
                    };
                });
            });
        },

        /**
         * Delete a post
         */
        deletePost: function (idx, boardCode) {
            return openDB().then(function (database) {
                return new Promise(function (resolve, reject) {
                    var transaction = database.transaction([STORE_NAME], 'readwrite');
                    var store = transaction.objectStore(STORE_NAME);
                    store.delete(idx);

                    // Server Delete
                    var apiPath = 'php/delete_file.php';
                    if (location.pathname.indexOf('/bbs/') > -1) apiPath = '../php/delete_file.php';

                    // Path: bbs/boardCode/filename
                    // We need boardCode. If not provided, might be tricky.
                    // Assuming idx is filename?
                    // If boardCode is missing, we can't easily allow delete from Server without scanning.
                    if (boardCode) {
                        var filePath = 'bbs/' + boardCode + '/' + idx;
                        fetch(apiPath, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: filePath })
                        });
                    }

                    resolve({ success: true, message: '삭제되었습니다.' });
                });
            });
        }
    };
})();

// Initialize on load
BoardManager.init();
