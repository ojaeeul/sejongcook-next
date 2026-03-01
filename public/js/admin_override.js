
// Admin Authority Override Script (Restored to Safe Mode)
// This script overrides the default board functions to prevent "Login Required" alerts.
// It runs in "Simulation Mode" - no server required.

// [FAILSAFE] Ensure AuthManager exists here too
if (typeof window.AuthManager === 'undefined') {
    window.AuthManager = {
        checkAdmin: function () { return true; },
        getCurrentUser: function () { return { level: 10 }; }
    };
    console.log("AuthManager: Created failsafe in admin_override.js");
}

// Helper to find the goList function or fallback
function goBackToList() {
    if (typeof goList === 'function') {
        goList();
    } else {
        history.back();
    }
}

// Override Write
function writeArticle() {
    // Permission Check
    var boardCode = location.pathname.split('/').pop().split('.')[0];
    // Check if we are in a sub-directory or if the filename is the board code
    // If we are in /bbs/sub0602.html, boardCode is sub0602.
    // If we are in /bbs/sub0601/view.html, logic might differ but usually this function is called from list/view.

    // Auth Check
    var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin());

    // Allow Q&A (sub0602) for everyone. Block others for non-admins.
    // Allow Q&A (sub0602) for everyone. Block others for non-admins.
    if (boardCode !== 'sub0602' && !isAdmin) {
        // Note: boardCode check might need to be robust if code extraction fails
        // Let's assume standard codes.
        if (['sub0501', 'sub0502', 'sub0601', 'sub0604', 'sub0603'].indexOf(boardCode) > -1) {
            alert("글쓰기 권한이 없습니다. (관리자 전용)");
            return;
        }
    }

    // Redirect to BoardUI Write Mode
    if (window.BoardUI) {
        // Lazy Initialization for Legacy Pages (where init() wasn't called)
        if (!BoardUI.boardCode) {
            var fileName = location.pathname.split('/').pop(); // e.g., sub0601.html
            var code = fileName.split('.')[0]; // sub0601

            // Allow overrides for specific known files if needed, but filename usually matches
            BoardUI.boardCode = code;

            // Find a suitable container
            if (document.getElementById('scbd')) {
                BoardUI.containerId = 'scbd';
            } else if (document.getElementById('board-content')) {
                BoardUI.containerId = 'board-content';
            } else {
                // If no container found, create one or alert?
                // Most pages have 'scbd' or 'board-content'
                console.warn("No suitable container found for BoardUI. Defaulting to body replacement.");
                var div = document.createElement('div');
                div.id = 'board-content';
                document.body.innerHTML = ''; // Radical, but effective for 'Write' focus
                document.body.appendChild(div);
                BoardUI.containerId = 'board-content';
            }
            console.log("Lazy initialized BoardUI for " + code);
        }

        BoardUI.goWrite();
    } else {
        console.error("BoardUI object is missing. Scripts loaded:", document.scripts);
        alert("시스템 모듈(BoardUI)이 로드되지 않았습니다.\n\n페이지를 새로고침(F5) 해주세요.\n계속되면 관리자에게 문의하세요.");
    }
}

// Override Reply
function replyArticle() {
    alert("답변 기능은 아직 지원되지 않습니다.");
}

// Override Edit: The "Cool" Feature
// Enables editing directly in the browser
// Override Edit: Redirect to Board Write Mode
// Override Edit: Redirect to Board Write Mode
function editArticle() {
    var pathParts = location.pathname.split('/');
    var fileName = pathParts.pop(); // filename.html
    var boardCode = pathParts.pop(); // sub0601 (parent dir) or if flat? 
    // Wait, editArticle logic in file implies we are in /bbs/sub0601/filename.html structure for static pages.
    // If so, boardCode is indeed pathParts.pop().

    var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin());
    if (boardCode !== 'sub0602' && !isAdmin) {
        alert("수정 권한이 없습니다. (관리자 전용)");
        return;
    }

    // Construct relative path to list
    // If we are in bbs/sub0601/, list is ../sub0601.html
    var editUrl = '../' + boardCode + '.html?mode=write&idx=' + fileName.replace('.html', '');
    location.href = editUrl;
}

// Override Delete
// Override Delete: Call Server API
// Override Delete: Call Server API
function deleteArticle() {
    // Permission Check
    // Get boardCode from URL (assuming /bbs/sub0601/post.html context)
    function getBoardCodeFromURL() {
        const pathParts = location.pathname.split('/');
        return pathParts[pathParts.length - 2];
    }
    const validBoardCode = getBoardCodeFromURL();
    var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin());

    if (validBoardCode !== 'sub0602' && !isAdmin) {
        alert("삭제 권한이 없습니다. (관리자 전용)");
        return;
    }

    if (!confirm("🗑️ [삭제 확인]\n\n정말로 이 게시글을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) {
        return;
    }

    // Show loading state
    const btn = document.querySelector('.btn-delete-action') || document.querySelector('a[href^="javascript:deleteArticle"]');
    if (btn) {
        btn.innerHTML = '삭제중...';
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    }

    // Attempt to delete via Server API
    console.log(`[Delete] Requesting delete for ${validBoardCode}/${getFileNameFromURL()}`);

    const deleteRequest = fetch('/api/index.php?delete_post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            boardCode: validBoardCode,
            fileName: getFileNameFromURL()
        })
    })
        .then(response => {
            console.log(`[Delete] Response status: ${response.status}`);
            return response.json();
        });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    Promise.race([deleteRequest, timeoutPromise])
        .then(data => {
            console.log('[Delete] Data:', data);
            if (data.success) {
                // Success - Redirect immediately without blocking alert
                console.log("Delete success, redirecting...");
                // Slight delay to ensure server file operation completes if needed, but usually strictly better to just go
                window.location.replace('../' + validBoardCode + '.html');
            } else {
                alert("삭제 실패: " + data.error);
                if (btn) {
                    btn.innerHTML = '삭제';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }
            }
        })
        .catch(error => {
            console.error('[Delete] Error:', error);
            // Fallback to BoardManager if available
            if (window.BoardManager && window.BoardManager.deletePost) {
                console.log("[Delete] Attempting local BoardManager delete for " + validBoardCode + "/" + getFileNameFromURL());
                // We need the IDX. For static files, IDX is filename?
                // BoardManager stores static files with 'static_' prefix or filename?
                // In BoardManager.init, we mapped content_data to 'static_' + filename.
                // But newly created posts (saved via fallback) might be 'local_' or just filename.

                // Try deleting by filename first
                var idx = getFileNameFromURL().replace('.html', '');

                // Also try 'static_' prefix just in case
                BoardManager.deletePost(idx).then(function (res) {
                    if (res.success) {
                        alert("삭제되었습니다. (로컬 데이터)");
                        window.location.replace('../' + validBoardCode + '.html');
                    } else {
                        // Try static prefix
                        BoardManager.deletePost('static_' + idx + '.html').then(function (res2) {
                            if (res2.success) {
                                alert("삭제되었습니다. (로컬 데이터/Static)");
                                window.location.replace('../' + validBoardCode + '.html');
                            } else {
                                alert("⚠️ [삭제 실패]\n서버 및 로컬 삭제 모두 실패했습니다.");
                            }
                        });
                    }
                });
            } else {
                if (error.message === 'Timeout') {
                    alert("⚠️ [시간 초과]\n서버 응답이 없습니다. 서버가 켜져있는지 확인해주세요.");
                } else {
                    alert("⚠️ [통신 오류]\n삭제 요청 중 오류가 발생했습니다.\n" + error.message);
                }
            }
            if (btn) {
                btn.innerHTML = '삭제';
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });
}

// Override Move
// Override Move
// Override Move
function moveArticle() {
    var isAdmin = (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin());
    if (!isAdmin) {
        alert("이동 권한이 없습니다. (관리자 전용)");
        return;
    }
    alert("이동 기능은 준비 중입니다. (관리자용)");
}

// Override Print
function board_view_print() {
    window.print();
}

// Override Secret Read
function no_write() {
    writeArticle();
}

function goAdminGuide() {
    // Legacy support
    writeArticle();
}

console.log("Admin Authority: Safe Simulation Mode Active.");

// Admin Indicator for BBS Pages (Auto-Init)
(function () {
    // Wait for DOM
    var initIndicator = function () {
        if (typeof AuthManager !== 'undefined' && AuthManager.checkAdmin()) {
            // Find GNB (Structure varies: #farmBoxGnb > ul or .gnb_381048_ > ul)
            var $gnbUl = $('#farmBoxGnb > ul');
            if ($gnbUl.length === 0) {
                // Fallback selector for some sub pages
                $gnbUl = $('.gnb_381048_ > ul');
            }

            if ($gnbUl.length && $gnbUl.find('.admin-indicator-li').length === 0) {
                // Add CSS for animation
                if ($('#admin-indicator-style').length === 0) {
                    $('head').append('<style id="admin-indicator-style">@keyframes spin-admin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .admin-icon { display: inline-block; animation: spin-admin 4s linear infinite; font-size: 1.2em; cursor: help; }</style>');
                }
                // Append Icon
                $gnbUl.append('<li class="admin-indicator-li" style="margin-left: 10px;"><span class="admin-icon" title="관리자 로그인 상태">⚙️</span></li>');
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIndicator);
    } else {
        initIndicator();
        // Retry a bit later mainly for frame updates
        setTimeout(initIndicator, 1000);
    }
})();
