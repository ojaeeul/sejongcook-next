/**
 * Board UI Controller
 * Handles List, View, and Write modes for all boards in a Single Page Application style.
 */

var BoardUI = {
    boardCode: null,
    containerId: 'board-container', // Default container ID

    init: function (boardCode, containerId) {
        this.boardCode = boardCode;
        if (containerId) this.containerId = containerId;

        // Parse URL parameters to determine mode
        var params = this.getUrlParams();
        var mode = params.mode || 'list';
        var idx = params.idx || null;

        console.log("BoardUI Init:", boardCode, mode, idx);

        if (mode === 'view' && idx) {
            this.renderView(idx);
        } else if (mode === 'write') {
            this.renderWrite(idx);
        } else {
            this.renderList();
        }
    },

    getUrlParams: function () {
        var params = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
            params[key] = decodeURIComponent(value);
        });
        return params;
    },

    // --- RENDER MODES ---

    renderList: function () {
        var self = this;
        var posts = [];

        // Fetch posts from BoardManager (using Promise if available, otherwise assume sync or callback needed)
        // Assuming BoardManager.getPosts returns a promise based on previous file analysis
        BoardManager.getPosts(this.boardCode).then(function (fetchedPosts) {
            posts = fetchedPosts || [];
            self._drawList(posts);
        });
    },

    _drawList: function (posts) {
        var html = '';
        var boardName = "공지사항";
        if (this.boardCode === 'sub0602') boardName = "질문&답변";
        if (this.boardCode === 'sub0501') boardName = "구인정보";
        if (this.boardCode === 'sub0502') boardName = "구직정보";
        if (this.boardCode === 'sub0603') boardName = "관련사이트";

        // Header (Title + Write/Search) - Matching original sub0601 layout
        html += '<div id="lay_hd" class="lay_hd">';
        html += '  <div class="hgroup">';
        html += '    <h1><a href="javascript:void(0)" onclick="BoardUI.goList()">' + boardName + '</a></h1>';
        // Permission Check
        var canWrite = false;

        // 1. Q&A (sub0602) is open to everyone
        if (this.boardCode === 'sub0602') {
            canWrite = true;
        }
        // 2. Other boards are Admin only
        else if (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) {
            canWrite = true;
        }

        html += '    <ul>';
        html += '      <li><a href="#" id="btnToggleSearch">검색<i class="ui-ico search"></i></a></li>';
        if (canWrite) {
            html += '      <li><a href="javascript:BoardUI.goWrite()">글쓰기<i class="ui-ico write"></i></a></li>';
        }
        html += '    </ul>';
        html += '  </div>';

        // Search Form (Toggle)
        html += '  <div id="toggleSearch" class="toggleSearch">';
        html += '    <fieldset>';
        html += '      <legend class="blind">게시글 검색</legend>';
        html += '      <div>';
        html += '        <input type="text" name="search_key" id="search_key" maxlength="30" value="" placeholder="검색어">';
        html += '        <button class="ui-ico">검색</button>';
        html += '      </div>';
        html += '    </fieldset>';
        html += '  </div>';
        html += '</div>';

        // Board List Container
        html += '<div id="list_board" class="list_board">';

        // List Header
        html += '  <ul class="lst-board lst-head">';
        html += '    <li>';
        html += '      <div class="td col_no">번호</div>';
        html += '      <div class="td col_subject">제목</div>';
        html += '      <div class="td col_name">이름</div>';
        html += '      <div class="td col_date">날짜</div>';
        html += '      <div class="td col_hit">조회수</div>';
        html += '    </li>';
        html += '  </ul>';

        // List Body
        html += '  <ul class="lst-board lst-body lay-notice">'; // lay-notice for specific styling if needed

        if (posts.length === 0) {
            html += '<li class="clr" style="padding:50px; text-align:center;">등록된 게시글이 없습니다.</li>';
        } else {
            // Sort by ID desc
            posts.sort(function (a, b) { return b.idx - a.idx; });

            posts.forEach(function (post) {
                // Simplify ID display for new posts
                var displayId = post.idx;
                if (String(post.idx).indexOf('local_') > -1 || String(post.idx).length > 10) {
                    displayId = '<span style="color:#ff8c00; font-weight:bold;">N</span>';
                }

                html += '    <li class="clr">';
                html += '      <div class="td col_no">' + displayId + '</div>';
                html += '      <div class="td col_subject">';
                html += '        <div style="padding-left:0px;">';
                html += '          <a href="javascript:void(0)" onclick="BoardUI.goView(\'' + post.idx + '\')">';
                html += '            <span>' + (post.subject || '제목 없음') + '</span>';
                if (post.file) { // Show file icon if file exists (mock logic)
                    html += '            <img src="../img_up/tmp_img/service/board_tpl/8/pc/img/ico_file.png" height="12" alt="file" style="margin-left: 5px;">';
                }
                html += '          </a>';
                html += '        </div>';
                html += '      </div>';
                html += '      <div class="td inf col_name">' + (post.author || '관리자') + '</div>';
                html += '      <div class="td inf col_date">' + (post.date || '-') + '</div>';
                html += '      <div class="td inf col_hit"><span class="txt">조회수:</span>' + (post.hit || 0) + '</div>';
                html += '    </li>';
            });
        }

        html += '  </ul>';
        html += '</div>';

        $('#' + this.containerId).html(html);
    },

    renderView: function (idx) {
        var self = this;
        BoardManager.getPost(this.boardCode, idx).then(function (post) {
            if (!post) {
                console.error("Post not found for idx:", idx);
                alert('게시글을 찾을 수 없습니다. (ID: ' + idx + ')');
                self.renderList();
                return;
            }

            var html = '';
            html += '<div class="board-view">';
            html += '  <div class="view-header" style="border-bottom:1px solid #ddd; padding-bottom:15px; margin-bottom:20px;">';
            html += '    <h2 style="font-size:24px; margin-bottom:10px;">' + (post.subject || '제목 없음') + '</h2>';
            html += '    <div class="meta" style="color:#666; font-size:14px;">';
            html += '      <span>작성자: ' + (post.author || '관리자') + '</span> | ';
            html += '      <span>작성일: ' + (post.date || '-') + '</span> | ';
            html += '      <span>조회: ' + (post.hit || 0) + '</span>';
            html += '    </div>';
            html += '  </div>';

            html += '  <div class="view-content" style="min-height:300px; padding:20px 0; border-bottom:1px solid #ddd; line-height:1.6;">';
            html += post.content || '';
            html += '  </div>';

            var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin());
            var isQkA = (self.boardCode === 'sub0602');

            html += '  <div class="view-footer" style="margin-top:20px; text-align:right;">';
            html += '    <button onclick="BoardUI.goList()" class="btn-default" style="margin-right:5px; padding: 10px 20px; border: 1px solid #ddd; background: #fff; cursor: pointer;">목록</button>';
            html += '    <button onclick="window.print()" class="btn-default" style="margin-right:5px; padding: 10px 20px; border: 1px solid #333; background: #333; color: #fff; cursor: pointer;">출력</button>';

            // Edit/Delete: Show if Admin OR Q&A (Q&A usually has password check, so we show buttons)
            // For other boards, strict Admin check.
            if (isAdmin || isQkA) {
                html += '    <button onclick="BoardUI.goDelete(\'' + idx + '\')" class="btn-danger" style="margin-right:5px; padding: 10px 20px; border: 1px solid #d9534f; background: #d9534f; color: white; cursor: pointer;">삭제</button>';
                html += '    <button onclick="BoardUI.goWrite(\'' + idx + '\')" class="btn-primary" style="padding: 10px 20px; border: 1px solid #007bff; background: #007bff; color: white; cursor: pointer;">수정</button>';
            }

            if (isAdmin) {
                html += '   <button onclick="alert(\'이동 기능 준비중\')" class="btn-default" style="margin-left:5px; padding: 10px 20px; border: 1px solid #555; background: #555; color: white; cursor: pointer;">이동</button>';
            }
            html += '  </div>';
            html += '</div>';

            $('#' + self.containerId).html(html);
        });
    },

    // --- RESOURCE LOADER ---
    loadResources: function (callback) {
        if (window.toastui && window.toastui.Editor) {
            callback();
            return;
        }

        // Load CSS
        var cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://uicdn.toast.com/editor/latest/toastui-editor.min.css';
        document.head.appendChild(cssLink);

        // Load JS
        var script = document.createElement('script');
        script.src = 'https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    },

    renderWrite: function (idx) {
        var self = this;
        var mode = idx ? 'edit' : 'new';
        var post = { subject: '', content: '', author: '관리자', password: '' };

        var drawForm = function () {
            self.loadResources(function () {
                var html = '';
                html += '<div class="board-write" style="max-width:1000px; margin:0 auto; background:#fff; padding:20px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">';
                html += '  <h2 style="margin-bottom:20px; border-bottom:2px solid #ff8c00; padding-bottom:10px; font-size:20px;">' + (mode === 'edit' ? '게시글 수정' : '게시글 작성') + '</h2>';

                html += '  <div style="margin-bottom:15px;">';
                html += '    <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">제목</label>';
                html += '    <input type="text" id="w_subject" value="' + post.subject + '" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">';
                html += '  </div>';

                html += '  <div style="margin-bottom:15px; display:flex; gap:15px;">';
                html += '    <div style="flex:1;">';
                html += '      <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">작성자</label>';
                html += '      <input type="text" id="w_author" value="' + post.author + '" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">';
                html += '    </div>';
                html += '    <div style="flex:1;">';
                html += '      <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555;">비밀번호</label>';
                html += '      <input type="password" id="w_password" value="' + post.password + '" placeholder="수정/삭제용 (선택)" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">';
                html += '    </div>';
                html += '  </div>';

                // Toast UI Editor Container
                html += '  <div id="editor" style="margin-bottom:20px;"></div>';

                html += '  <div class="write-footer" style="margin-top:20px; text-align:center;">';
                html += '    <button onclick="BoardUI.goList()" class="btn-default" style="margin-right:10px; padding: 12px 30px; border: none; background: #ccc; color:#333; cursor: pointer; border-radius:4px; font-weight:bold;">취소</button>';
                html += '    <button onclick="BoardUI.savePost(' + (idx || 'null') + ')" class="btn-primary" style="padding: 12px 30px; border: none; background: #ff8c00; color: white; cursor: pointer; border-radius:4px; font-weight:bold;">저장하기</button>';
                html += '  </div>';
                html += '</div>';

                $('#' + self.containerId).html(html);

                // Initialize Toast UI Editor
                self.editor = new toastui.Editor({
                    el: document.querySelector('#editor'),
                    height: '500px',
                    initialEditType: 'wysiwyg',
                    previewStyle: 'vertical',
                    initialValue: post.content,
                    placeholder: '내용을 입력하세요...',
                    toolbarItems: [
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock']
                    ]
                });
            });
        };

        if (mode === 'edit') {
            BoardManager.getPost(this.boardCode, idx).then(function (p) {
                if (p) post = p;
                drawForm();
            });
        } else {
            drawForm();
        }
    },

    // --- ACTIONS ---

    goList: function () {
        // Reload to the clean URL (removing ?mode=list etc.)
        // This ensures that if server updated the static file, we see the new content.
        window.location.href = window.location.pathname;
    },

    goView: function (idx) {
        this.changeUrl('view', idx);
        this.renderView(idx);
    },

    goWrite: function (idx) {
        this.changeUrl('write', idx);
        this.renderWrite(idx);
    },

    goDelete: function (idx) {
        var pwd = prompt("비밀번호를 입력하세요:");
        if (pwd) {
            var self = this;
            // For static saves, we might not have a password check on server simplified logic.
            // But we will pass it anyway.
            // Actually, we should call the delete API.

            // 1. Identify filename (idx is often "static_...html" or just filename in some contexts)
            // If it comes from 'newPost', idx is filename without extension.
            // Let's assume idx is the unique identifier or filename.

            // We need the filename including extension for the server to find it.
            var filename = idx;
            if (!filename.endsWith('.html')) filename += '.html';

            // Verify with BoardManager? 
            // BoardManager.deletePost logic is local DB. We want Server.

            this.callServer('/api/index.php?delete_post', {
                boardCode: this.boardCode,
                fileName: filename, // Start with filename assumption
                idx: idx,
                password: pwd
            }, function (success, res) {
                if (success) {
                    alert("삭제되었습니다.");
                    // Reload to clean URL to see static file update
                    window.location.href = window.location.pathname;
                } else {
                    alert("삭제 실패: " + (res.error || "알 수 없는 오류"));
                    // Fallback to local if needed? modify local DB...
                    BoardManager.deletePost(self.boardCode, idx, pwd); // Try local as well
                }
            });
        }
    },

    // --- EDITOR FUNCTIONS (Toast UI Handles internal logic, simplified wrapper) ---

    savePost: function (idx) {
        var subject = $('#w_subject').val();
        var author = $('#w_author').val();
        var password = $('#w_password').val();
        var content = this.editor.getHTML(); // Get Content from Toast UI

        if (!subject.trim()) { alert('제목을 입력하세요.'); return; }
        if (!author.trim()) { alert('작성자를 입력하세요.'); return; }
        if (!content.trim()) { alert('내용을 입력하세요.'); return; }

        var now = new Date();
        var dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        // Generate filename: YYYYMMDD_HHMMSS.html
        var filename = now.getFullYear() +
            ('0' + (now.getMonth() + 1)).slice(-2) +
            ('0' + now.getDate()).slice(-2) + '_' +
            ('0' + now.getHours()).slice(-2) +
            ('0' + now.getMinutes()).slice(-2) +
            ('0' + now.getSeconds()).slice(-2) + '.html';

        // 1. Prepare Data
        var newPost = {
            "file": filename,
            "subject": subject, // Corrected key to match board_data.js
            "date": dateStr,
            "author": author,
            "hits": "0",
            "content": content,
            "boardCode": this.boardCode,
            "idx": filename.replace('.html', ''),
            "hit": 0
        };

        var postHTML = this.generatePostHTML(subject, author, dateStr, content);

        // 2. Try Saving via API (Unified Path)
        var self = this;
        // The API endpoint is now unified: /api/index.php?save_post
        // We pass this cleanly.
        this.callServer('/api/index.php?save_post', {
            boardCode: this.boardCode,
            fileName: filename,
            content: postHTML,
            metaData: newPost
        }, function (success, response) {
            if (success) {
                alert("✅ [저장 완료]\n\n게시글이 성공적으로 등록되었습니다.");
                self.goList();
            } else {
                var errorMsg = (response && response.error) ? response.error : (response || "알 수 없는 오류");
                console.error("Server Save Error:", errorMsg);
                alert("⚠️ [저장 실패]\n" + errorMsg + "\n\n(서버 상태를 확인해주세요)");
            }
        });
    },

    fallbackSave: function (filename, postHTML, newPost) {
        // Fallback is practically deprecated as we now support direct saving on both envs.
        // Keeping it just in case critical failure.
        alert("⚠️ [비상 모드] 파일 다운로드로 저장합니다.");
        if (!window.STATIC_BOARD_DATA) { window.STATIC_BOARD_DATA = {}; }
        if (!window.STATIC_BOARD_DATA[this.boardCode]) { window.STATIC_BOARD_DATA[this.boardCode] = []; }

        window.STATIC_BOARD_DATA[this.boardCode].unshift(newPost);
        var dataJS = "window.STATIC_BOARD_DATA = " + JSON.stringify(window.STATIC_BOARD_DATA, null, 2) + ";";

        // Download Files
        this.downloadFile(filename, postHTML);

        var self = this;
        setTimeout(function () {
            self.downloadFile('board_data.js', dataJS);
            alert("⚠️ [서버 미연결]\n\n로컬 서버가 실행되지 않아 '파일 다운로드' 방식으로 진행됩니다.\n\n1. 다운로드된 '" + filename + "' 파일을 'bbs/" + self.boardCode + "/' 로 이동.\n2. 'board_data.js'를 'js/' 로 덮어쓰기.\n\n(터미널에서 'node server.js'를 실행하면 자동 저장됩니다.)");
            self.goList();
        }, 500);
    },

    callServer: function (endpoint, data, callback) {
        // Use relative path for endpoint (removes http://localhost:3000)
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(function (res) {
                if (res.ok) return res.json();
                return res.json().then(function (errJson) {
                    throw new Error(errJson.error || 'Server Error ' + res.status);
                }).catch(function () {
                    throw new Error('Server Error ' + res.status);
                });
            })
            .then(function (json) {
                callback(true, json);
            })
            .catch(function (err) {
                console.error("API Call Failed:", err);
                callback(false, err);
            });
    },

    generatePostHTML: function (title, author, date, content) {
        // Simple Template based on creating_post.py / template_post.html logic
        // We need adjusted pathing because manual posts are in bbs/subMock/ but this runs from root?
        // Actually, posts are usually in bbs/sub0601/ so relative links like ../../ work.

        var boardName = "공지사항";
        if (this.boardCode === 'sub0602') boardName = "질문&답변";
        if (this.boardCode === 'sub0501') boardName = "구인정보";
        if (this.boardCode === 'sub0502') boardName = "구직정보";

        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes">
    <link rel="stylesheet" href="../../css/head_basic.css" type="text/css" media="all" />
    <link rel="stylesheet" href="../../css/head_logout.css" type="text/css" media="all" />
    <link rel="stylesheet" href="../../css/head_logout.css" type="text/css" media="all" />
    <script type="text/javascript" src="../../js/all_default.js"></script>
    <script type="text/javascript" src="../../js/content_data.js"></script>
    <script type="text/javascript" src="../../js/board_manager.js"></script>
    <link rel="stylesheet" type="text/css" href="../../img_up/_addon/css/reset_1.0.css">
    <link rel="stylesheet" type="text/css" href="../../img_up/shop_pds/sejongcook/src_css_fram/pc.skin.custom2.css" />
    <link rel="stylesheet" type="text/css" href="../../img_up/tmp_img/service/board_tpl/8/pc/css/co-basic-simple.css" media="screen">
</head>
<body>
    <div class="layout_381045_">
        <div>
            <div class="container_1">
                <div style='margin-left:70px;'>
                    <div class="logo_381047_">
                        <h1><a href="../../main.html" target="_self"><img src="../../img_up/shop_pds/sejongcook/farm/logo1590397857.png" alt="로고"></a></h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div style='background-Color:#f7bc5a;'>
        <div class="layout_381049_">
            <div id="farmBoxLnb" class="lnb_381050_">
                <ul class="dep1">
                    <li><a href="../../page/sub0101.html">학원소개</a></li>
                    <li><a href="../../page/sub0201.html">제과제빵과정</a></li>
                    <li><a href="../../page/sub0301.html">조리교육과정</a></li>
                    <li><a href="../../page/sub0401.html">자격증&진학</a></li>
                    <li><a href="../sub0501.html">취업정보</a></li>
                    <li class="on"><a href="../sub0601.html">커뮤니티</a></li>
                    <li><a href="../../page/sub0701.html">상담/수강신청</a></li>
                </ul>
            </div>
        </div>
    </div>
    <span class="empty_line_381057_"></span>
    <div class="layout_381226_ grid_left">
        <div class="container_1">
            <div id="pm2-_381230_">
                <ul class="dep2">
                    <li class="${this.boardCode === 'sub0601' ? 'on' : ''}"><a href="../sub0601.html">공지사항</a></li>
                    <li class="${this.boardCode === 'sub0602' ? 'on' : ''}"><a href="../sub0602.html">질문&답변</a></li>
                    <li><a href="../../page/sub0603.html">관련사이트</a></li>
                    <li><a href="../sub0604.html">명예의 전당</a></li>
                </ul>
            </div>
        </div>
        <div class="container_2">
            <span class="empty_line_381232_"></span>
            <div class="sub_title_381227_">
                <h1>${boardName}</h1>
            </div>
            <span class="solid_line_381231_"></span>
            <div id="scbd" class="scbd co-basic-simple">
                <div id="lay_hd" class="lay_hd">
                    <div class="hgroup">
                        <h1><a href="../${this.boardCode}.html">${boardName}</a></h1>
                    </div>
                </div>
                <div class="det">
                    <div class="hgroup">
                        <div class="title"><strong>${title}</strong></div>
                        <dl>
                            <dt>
                                <span>작성자: ${author}</span>
                                <span>조회수: 0</span>
                            </dt>
                            <dd><span>${date}</span></dd>
                        </dl>
                    </div>
                    <div id="conbody" class="conbody">
                        ${content}
                    </div>
                    <div class="btngroup">
                        <a href="../${this.boardCode}.html" class="ui-btn btn-co1">목록<i class="ui-ico ico-list"></i></a>
                        <a href="javascript:board_view_print()" class="ui-btn btn-co1">출력<i class="ui-ico ico-print"></i></a>
                        <a href="javascript:editArticle()" class="ui-btn btn-co1">수정<i class="ui-ico ico-edit"></i></a>
                        <a href="javascript:deleteArticle()" class="ui-btn btn-co1" style="background-color: #d9534f; color: #fff;">삭제<i class="ui-ico ico-delete"></i></a>
                        <a href="javascript:moveArticle()" class="ui-btn btn-co1">이동<i class="ui-ico ico-move"></i></a>
                    </div>
                </div>
            </div>
            <style>
                .ui-btn .ui-ico { display: inline-block; width: auto; height: auto; margin-left: 5px; font-style: normal; text-decoration: none; }
                .ui-ico.ico-list::before { content: "☰"; }
                .ui-ico.ico-print::before { content: "🖨"; }
                .ui-ico.ico-edit::before { content: "✏️"; }
                .ui-ico.ico-delete::before { content: "🗑️"; }
                .ui-ico.ico-move::before { content: "➡"; }
            </style>
                </div>
            </div>
        </div>
    </div>
    <script type="text/javascript" src="../../js/all_bottom_script.js"></script>
    <script type="text/javascript" src="../../js/admin_override.js?v=${Date.now()}"></script>
</body>
</html>`;
    },

    downloadFile: function (filename, content) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    },

    // --- UTILS ---

    changeUrl: function (mode, idx) {
        // Update URL without reloading using History API
        var newUrl = window.location.pathname + '?mode=' + mode;
        if (idx) newUrl += '&idx=' + idx;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }
};

// Handle Back Button
window.onpopstate = function (event) {
    // Ideally re-init, but for simplicity reload
    window.location.reload();
};
