/**
 * Admin Manager Script
 * Handles Admin Tool logic (Unified Manager, Post Manager, Logo Editor, User Management)
 * Extracted from admin.html
 */

// -- Unified Manager Logic --
let currentEditingCatId = null;
let currentEditingBoardCode = '';
let currentEditingPageId = '';
let currentSelectedBoard = null; // For detail edit

function openPostManager(bCode, bName, pId) {
    currentEditingBoardCode = bCode;
    currentEditingPageId = pId;

    $('#pmm-title').text(bName + ' 관리');
    $('#pmm-subtitle').text('Board Code: ' + bCode);

    // Config Logic
    if (pId && siteContent.subPages && siteContent.subPages[pId]) {
        $('#pmm-config-section').show(); // Show config
        var conf = siteContent.subPages[pId].boardConfig || { enable: false, title: bName, count: 5 };
        $('#pmm-enable').prop('checked', conf.enable);
        $('#pmm-name').val(conf.title || bName);
        $('#pmm-count').val(conf.count || 5);
    } else {
        $('#pmm-config-section').hide(); // Hide if no page context
    }

    // Post Logic
    renderPostManagerList();
    $('#post-manager-modal').fadeIn();
}

function renderPostManagerList() {
    $('#pmm-list').html('<tr><td colspan="5" style="padding:20px; text-align:center;">Loading...</td></tr>');

    BoardManager.getPosts(currentEditingBoardCode).then(function (posts) {
        var html = '';
        if (!posts || posts.length === 0) {
            html = '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">게시글이 없습니다.</td></tr>';
        } else {
            posts.forEach((p, idx) => {
                html += `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:10px; text-align:center;">${posts.length - idx}</td>
                        <td style="padding:10px;">${p.subject}</td>
                        <td style="padding:10px; text-align:center;">${p.authorName}</td>
                        <td style="padding:10px; text-align:center;">${p.date}</td>
                        <td style="padding:10px; text-align:center;">
                            <button onclick="deletePostFromModal('${p.idx}')" style="background:#e74c3c; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:11px;">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
        $('#pmm-list').html(html);
    });
}

function saveBoardConfigFromModal() {
    if (!currentEditingPageId) return;

    var newConf = {
        enable: $('#pmm-enable').is(':checked'),
        title: $('#pmm-name').val(),
        count: parseInt($('#pmm-count').val()),
        code: currentEditingBoardCode
    };

    if (!siteContent.subPages[currentEditingPageId]) siteContent.subPages[currentEditingPageId] = {};
    siteContent.subPages[currentEditingPageId].boardConfig = newConf;

    // Persist
    localStorage.setItem('sejongcook_admin_config_v2', JSON.stringify(siteContent));
    alert('설정이 저장되었습니다.');

    // Refresh Unified List in background
    renderUnifiedManager();
}

function deletePostFromModal(idx) {
    if (confirm('정말 삭제하시겠습니까?')) {
        BoardManager.deletePost(idx).then(function (res) {
            alert(res.message);
            renderPostManagerList();
        });
    }
}

function renderUnifiedManager() {
    let html = '';
    let lastCat = '';

    // Define Categories Map (Single Source of Truth)
    var categories = {
        'index': 'Main', 'sub01': '01.소개', 'sub02': '02.제과제빵', 'sub03': '03.조리과정',
        'sub04': '04.자격증', 'sub05': '05.취업정보', 'sub06': '06.커뮤니티'
    };

    // Build List from siteContent.subPages
    // Convert to array and sort
    let pages = Object.keys(siteContent.subPages).map(id => {
        let p = siteContent.subPages[id];
        let catCode = id === 'index' ? 'index' : id.substring(0, 5);
        let catName = categories[catCode] || '기타';
        // Handle sub-pages that are category parents (e.g. sub01)
        if (id.length === 5 && categories[id]) {
            catName = categories[id];
            catCode = id;
        }

        return {
            id: id,
            name: p.title || '제목 없음',
            cat: catName,
            catCode: catCode
        };
    });

    // Sort by CatCode then ID
    pages.sort((a, b) => {
        if (a.catCode < b.catCode) return -1;
        if (a.catCode > b.catCode) return 1;
        return a.id.localeCompare(b.id);
    });

    pages.forEach(p => {
        // Category Header Row
        if (p.cat !== lastCat) {
            let parentEditBtn = '';
            // If the category itself is a page (like sub01), add button
            if (siteContent.subPages[p.catCode]) {
                parentEditBtn = `<button onclick="goToPageEdit('${p.catCode}')" style="margin-left:10px; padding:3px 10px; font-size:11px; background:#2980b9; color:white; border:none; border-radius:4px; cursor:pointer;">📝 상위 페이지/게시판 수정 (Edit Parent)</button>`;
            }

            html += `
                <tr style="background:#f0f3f6;">
                    <td colspan="6" style="padding:10px 15px; font-weight:bold; color:#2c3e50; border-bottom:1px solid #ddd; border-top:2px solid #fff;">
                        📂 ${p.cat} ${parentEditBtn}
                    </td>
                </tr>
            `;
            lastCat = p.cat;
        }

        // 1. Content Status
        let pageData = siteContent.subPages[p.id];
        let hasContent = (pageData.htmlContent && pageData.htmlContent.length > 50);
        let statusHtml = hasContent
            ? '<span class="status-badge status-approved">✅ 작성완료</span>'
            : '<span class="status-badge status-pending">⚠ 미작성</span>';

        // 2. Buttons
        let editBtn = `<button onclick="goToPageEdit('${p.id}')" class="btn-save" style="padding:6px 12px; font-size:12px; background:#2980b9;">📝 에디터 (Editor)</button>`;
        let previewBtn = `<button onclick="openPreview('${p.id}')" class="btn-save" style="padding:6px 12px; font-size:12px; background:#27ae60;">👁️ 미리보기</button>`;

        let postBtn = '-';
        if (pageData.boardConfig && pageData.boardConfig.enable) {
            let bCode = pageData.boardConfig.code || 'default'; // Should probably be generated or stored
            postBtn = `<button onclick="openPostManager('${bCode}', '${p.name}', '${p.id}')" class="btn-save" style="padding:6px 12px; font-size:12px; background:#e67e22;">⚙️ 설정/게시글 (Setting)</button>`;
        }

        html += `
            <tr style="border-bottom:1px solid #eee; background:white;">
                <td style="padding:12px 15px; color:#7f8c8d; font-size:11px;">${p.id}</td>
                <td style="padding:12px 15px; font-weight:bold;">${p.name}</td>
                <td style="padding:12px 15px; text-align:center;">${statusHtml}</td>
                <td style="padding:12px 15px; text-align:center;">
                    <div style="display:flex; justify-content:center; gap:5px;">
                        ${editBtn} ${previewBtn}
                    </div>
                </td>
                <td style="padding:12px 15px; text-align:center;">${postBtn}</td>
            </tr>
        `;
    });
    $('#unified-list-tbody').html(html);
}

function openPreview(pageId) {
    let pageData = siteContent.subPages[pageId];
    if (!pageData) {
        alert('페이지 데이터를 찾을 수 없습니다.');
        return;
    }

    $('#preview-title').text('👁️ 미리보기: ' + pageData.title);

    let content = pageData.htmlContent;
    if (!content || content.length < 10) content = '<div style="text-align:center; color:#999; padding:50px;">작성된 내용이 없습니다. (Empty)</div>';

    // Wrap in a simulation container for styling
    let wrapper = `
        <div style="max-width:800px; margin:0 auto; background:white; min-height:500px;">
            <h1 style="font-size:2rem; border-bottom:2px solid #eee; padding-bottom:15px; margin-bottom:30px;">${pageData.title}</h1>
            <div class="content-preview-body">
                ${content}
            </div>
        </div>
    `;

    $('#preview-content').html(wrapper);
    $('#preview-modal').fadeIn();
}

function updateBoardName() {
    if (!currentSelectedBoard) return;
    var newName = $('#detail-edit-name').val().trim();
    if (!newName) return;

    var configs = BoardManager.getConfigs();
    var conf = configs.find(c => c.code === currentSelectedBoard);
    if (conf) {
        conf.name = newName;
        // Mock save logic if needed, or rely on BoardManager
        // localStorage.setItem('board_configs', JSON.stringify(configs));  <-- BoardManager handles this via updateConfig if exposed?
        // But BoardManager.updateConfig expects full object.
        // Let's just alert for now as this function was legacy.
        alert('저장되었습니다.');
        // renderMasterList(); // ?
        $('#detail-board-title').text(newName);
    }
}

function deletePostAdmin(idx) {
    if (confirm('삭제하시겠습니까?')) {
        BoardManager.deletePost(idx).then(function (res) {
            if (res.success) {
                // Refresh?
                renderPostManagerList(); // If in post manager context
            } else {
                alert(res.message);
            }
        });
    }
}


// -- Page Management Logic (MANAGED_PAGES) --
const MANAGED_PAGES = [
    { cat: 'Main', name: '홈페이지 (Main)', id: 'index' },
    { cat: '01.소개', name: '인사말 (Greetings)', id: 'sub0101' },
    { cat: '01.소개', name: '강사 프로필 (Profile)', id: 'sub0102' },
    { cat: '01.소개', name: '오시는 길 (Map)', id: 'sub0103' },
    { cat: '02.제과제빵', name: '제과/제빵기능사반', id: 'sub0201' },
    { cat: '02.제과제빵', name: '케익디자인반', id: 'sub0202' },
    { cat: '02.제과제빵', name: '홈베이커리반', id: 'sub0203' },
    { cat: '02.제과제빵', name: '취업반', id: 'sub0204' },
    { cat: '03.조리과정', name: '조리기능사반', id: 'sub0301' },
    { cat: '03.조리과정', name: '가정요리반', id: 'sub0302' },
    { cat: '03.조리과정', name: '브런치반', id: 'sub0307' },
    { cat: '03.조리과정', name: '단체위탁교육', id: 'sub0306' },
    { cat: '04.자격증', name: '자격시험일정', id: 'sub0401' },
    { cat: '04.자격증', name: '자격시험안내', id: 'sub0402' },
    { cat: '04.자격증', name: '대학진학', id: 'sub0405' },
    { cat: '05.취업정보', name: '구인/구직 (게시판)', id: 'sub0501', isBoard: true },
    { cat: '06.커뮤니티', name: '공지사항/QnA', id: 'sub0601', isBoard: true }
];

function renderAdminPageList() {
    let html = '';
    MANAGED_PAGES.forEach(p => {
        let btnHtml = '';
        let snippet = '';

        // Get snippet from siteContent if available
        if (typeof siteContent !== 'undefined' && siteContent.subPages && siteContent.subPages[p.id]) {
            let content = siteContent.subPages[p.id].htmlContent || '';
            let text = content.replace(/<[^>]*>?/gm, '');
            snippet = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        } else if (p.id === 'index') {
            snippet = '(메인 페이지는 전용 편집기 사용 권장)';
        }

        if (p.isBoard) {
            btnHtml = `<span style="color:#999;">(게시판 관리 이용)</span>`;
        } else {
            // Replaced Quick Edit with direct Page Edit as per request
            btnHtml = `<button onclick="goToPageEdit('${p.id}')" style="background:#2ecc71; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:13px;">
                       📝 내용 수정 (Edit Content)
                       </button>`;
        }

        html += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px; font-weight:bold; color:#555;">${p.cat}</td>
                <td style="padding:10px;">
                    <div>${p.name}</div>
                    <div style="font-size:11px; color:#999;">${p.id}</div>
                </td>
                <td style="padding:10px; color:#666; font-size:12px;">
    ${snippet ? '<span style="background:#f0f0f0; padding:2px 5px; border-radius:3px;">' + snippet + '</span>' : '<span style="color:#ccc;">(내용 없음)</span>'}
                </td>
                <td style="padding:10px; text-align:center; min-width:180px;">
                    ${btnHtml}
                </td>
            </tr>
        `;
    });
    $('#admin-page-list-tbody').html(html);
}

// Make globally accessible
window.goToPageEdit = goToPageEdit;

function goToPageEdit(id) {
    // DEBUG: Remove this alert after confirming it works

    try {
        console.log("goToPageEdit called for ID:", id);
        // Select the page in the dropdown (hidden)
        $('#subpage-selector').val(id).trigger('change');

        // Explicitly load data
        loadSubPageData();
    } catch (err) {
        console.error("Error loading page data:", err);
        alert("데이터 로드 중 오류가 발생했습니다: " + err);
    }

    // Show Editor Modal (Force Display) - Run this REGARDLESS of data error
    console.log("Force Opening Page Edit Modal...");
    $('#page-edit-modal').css({
        'display': 'flex',
        'z-index': '99999',
        'opacity': '1',
        'visibility': 'visible'
    }).show(); // Direct show(), no fade animation to be safe
}

// Fallback: Event Delegation for Card Clicks
$(document).on('click', '.sitemap-card', function (e) {
    if ($(e.target).is('input') || $(e.target).is('button.btn-card-del')) return;

    var id = $(this).attr('id').replace('card-', '');
    if (id) goToPageEdit(id);
});

function closePageEditModal() {
    $('#page-edit-modal').fadeOut(300);
    // Optional: Refresh grid if titles changed?
    renderSitemapGrid();
}

// Global Save Function for Modal
window.savePageEditModal = function () {
    var pageId = $('#subpage-selector').val();
    if (!pageId || !siteContent.subPages[pageId]) return;

    // 1. Save Basic Info
    siteContent.subPages[pageId].title = $('#subpage-title-val').val();
    siteContent.subPages[pageId].topImage = $('#header-img-val').val();

    // 2. Save HTML Content (WYSIWYG)
    // Use Summernote API to get HTML code
    var htmlContent = $('#subpage-html-val').summernote('code');
    siteContent.subPages[pageId].htmlContent = htmlContent;

    // 3. Save Dynamic Items
    var items = [];
    $('#subpage-items-list .sub-item').each(function () {
        var $el = $(this);
        var item = {};

        // Detect Type based on fields present
        if ($el.find('.sub-i-html').length > 0) {
            item.title = $el.find('.sub-i-title').val();
            item.htmlContent = $el.find('.sub-i-html').val();
        } else if ($el.find('.sub-i-link').length > 0) {
            item.title = $el.find('.sub-i-title').val();
            item.desc = $el.find('.sub-i-desc').val();
            item.link = $el.find('.sub-i-link').val();
            item.linkText = $el.find('.sub-i-link-text').val();
        } else if ($el.find('.sub-i-img').length > 0) {
            item.title = $el.find('.sub-i-title').val() || "";
            item.desc = $el.find('.sub-i-desc').length ? $el.find('.sub-i-desc').val() : "";
            item.img = $el.find('.sub-i-img').val();
        } else {
            item.title = $el.find('.sub-i-title').val();
            item.desc = $el.find('.sub-i-desc').val();
            item.img = "";
        }
        items.push(item);
    });
    siteContent.subPages[pageId].items = items;

    // 4. Save & Close
    saveToLocal(true);
    closePageEditModal();
    renderSitemapGrid();
    alert('저장되었습니다.');
};


// -- Logo Management Logic --
function loadLogoSettings() {
    if (!siteContent.logo) return;

    // Type
    $('#logo-visible-val').prop('checked', siteContent.logo.visible !== false);
    $('input[name="logo-type"][value="' + siteContent.logo.type + '"]').prop('checked', true);

    // Image Mode
    $('#logo-src-val').val(siteContent.logo.src);
    $('#logo-alt-val').val(siteContent.logo.alt);
    $('#logo-width-val').val(parseInt(siteContent.logo.width) || 200);
    $('#logo-width-display').text((parseInt(siteContent.logo.width) || 200) + 'px');

    if (siteContent.logo.src) {
        $('#logo-preview-img').attr('src', siteContent.logo.src);
    }

    // Text Mode
    $('input[name="logo-lines"][value="' + (siteContent.logo.textLines || '1') + '"]').prop('checked', true);
    $('#logo-text-val').val(siteContent.logo.text);
    $('#logo-text-line1-val').val(siteContent.logo.textLine1);
    $('#logo-text-line2-val').val(siteContent.logo.textLine2);
    $('#logo-text-color').val(siteContent.logo.textColor || '#000000');
    $('#logo-text-color-hex').val(siteContent.logo.textColor || '#000000');
    $('#logo-text-size-val').val(siteContent.logo.textSize || '24px');
    $('#logo-text-font-val').val(siteContent.logo.textFont || "'Noto Sans KR', sans-serif");
    $('#logo-text-weight-val').val(siteContent.logo.textWeight || 'bold');

    // Prefix
    $('#logo-prefix-use').prop('checked', siteContent.logo.prefixUse !== false);
    $('#logo-prefix-text-val').val(siteContent.logo.prefixText || 'SJ');
    $('#logo-prefix-color').val(siteContent.logo.prefixColor || '#3498db');
    $('#logo-prefix-color-hex').val(siteContent.logo.prefixColor || '#3498db');
    $('#logo-prefix-size-val').val(siteContent.logo.prefixSize || '30px');

    // Position
    $('input[name="logo-pos-mode"][value="' + (siteContent.logo.posMode || 'normal') + '"]').prop('checked', true);
    $('input[name="logo-align"][value="' + (siteContent.logo.align || 'left') + '"]').prop('checked', true);

    $('#logo-top-val').val(siteContent.logo.top || '0px');
    $('#logo-left-val').val(siteContent.logo.left || '0px');
    $('#logo-zindex-val').val(siteContent.logo.zIndex || '100');

    // Trigger UI updates
    toggleLogoMode();
    toggleLogoLines(); // Ensure lines are toggled correctly
    toggleLogoPosition(); // Ensure panels are shown correctly
}

function toggleLogoMode() {
    var type = $('input[name="logo-type"]:checked').val();
    if (type === 'image') {
        $('#logo-controls-image').show();
        $('#logo-controls-text').hide();
        $('#logo-preview-img').show();
        $('#logo-preview-text').hide();
        $('#logo-proxy').text('IMAGE LOGO');
    } else {
        $('#logo-controls-image').hide();
        $('#logo-controls-text').show();
        $('#logo-preview-img').hide();
        $('#logo-preview-text').show();
        $('#logo-proxy').text('TEXT LOGO');
    }
}


function toggleLogoLines() {
    var lines = $('input[name="logo-lines"]:checked').val();
    if (lines === '2') {
        $('#logo-text-1line-group').hide();
        $('#logo-text-2line-group').show();
    } else {
        $('#logo-text-1line-group').show();
        $('#logo-text-2line-group').hide();
    }
}

function toggleLogoPosition() {
    var mode = $('input[name="logo-pos-mode"]:checked').val();
    if (mode === 'absolute') {
        // Visual Selection
        $('#label-mode-absolute').parent().find('span').css('background', '#2c3e50').css('color', '#fff');
        $('#label-mode-normal').parent().find('span').css('background', 'transparent').css('color', '#333');

        // Show/Hide Panels
        $('#logo-pos-normal-ctrl').css('opacity', '0.3').css('pointer-events', 'none');
        $('#logo-pos-absolute-ctrl').show().css('opacity', '1').css('pointer-events', 'auto');

        $('#info-normal').hide();
        $('#info-absolute').show();

        // Enable Drag
        enableLogoDrag(true);
    } else {
        // Visual Selection
        $('#label-mode-normal').parent().find('span').css('background', '#2c3e50').css('color', '#fff');
        $('#label-mode-absolute').parent().find('span').css('background', 'transparent').css('color', '#333');

        // Show/Hide Panels
        $('#logo-pos-normal-ctrl').css('opacity', '1').css('pointer-events', 'auto');
        $('#logo-pos-absolute-ctrl').css('opacity', '0.3').css('pointer-events', 'none');

        $('#info-normal').show();
        $('#info-absolute').hide();

        // Disable Drag
        enableLogoDrag(false);

        // Trigger Alignment Update
        var currentAlign = $('input[name="logo-align"]:checked').val();
        updateProxyAlignment(currentAlign);
    }
}

// Alignment Sync & Visual Update
// Note: This binding assumes jQuery is ready
// $('input[name="logo-align"]').change(...) is moved to init or needs to be re-bound if dynamic.
// Since admin.html usually runs these onload, we can keep the function ref here.

function updateProxyAlignment(align) {
    // Only update visuals if in Normal mode
    if ($('input[name="logo-pos-mode"]:checked').val() === 'normal') {
        var proxy = $('#logo-proxy');
        proxy.css({ 'transition': 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }); // Smooth movement

        // Reset Top to standard vertical position
        proxy.css('top', '50%').css('margin-top', '-20px'); // Vertically centered roughly

        if (align === 'left') {
            proxy.css({ left: '20px', right: 'auto', transform: 'none' });
        } else if (align === 'center') {
            proxy.css({ left: '50%', right: 'auto', transform: 'translateX(-50%)' });
        } else if (align === 'right') {
            proxy.css({ left: 'auto', right: '20px', transform: 'none' });
        }
    }
}

// Drag Logic
function enableLogoDrag(enabled) {
    // Always enable draggable, but visually distinguish modes
    try {
        if (!$('#logo-proxy').data('ui-draggable')) {
            $('#logo-proxy').draggable({
                containment: "#visual-editor-container",
                start: function (event, ui) {
                    // 1. Kill transition immediately for 1:1 feel
                    $(this).css('transition', 'none');

                    // 2. Capture current visual position to prevent jump when removing transforms
                    var currentPos = $(this).position();

                    // If dragging starts in Normal mode, switch to Absolute automatically
                    if ($('input[name="logo-pos-mode"]:checked').val() === 'normal') {
                        $('input[name="logo-pos-mode"][value="absolute"]').prop('checked', true).trigger('change');

                        // Fix position to pixels and strip relative styles
                        $(this).css({
                            'left': currentPos.left + 'px',
                            'top': currentPos.top + 'px',
                            'right': 'auto',
                            'transform': 'none'
                        });
                    }
                },
                stop: function (event, ui) {
                    // Re-enable transition for smooth updates if needed
                    $(this).css('transition', 'all 0.3s ease');

                    // Round to integer for cleaner values
                    var t = parseInt(ui.position.top);
                    var l = parseInt(ui.position.left);
                    $('#logo-top-val').val(t + 'px');
                    $('#logo-left-val').val(l + 'px');
                }
            });
        } else {
            $('#logo-proxy').draggable('enable');
        }

        // Visual Cues
        if (enabled) {
            $('#logo-proxy').css('cursor', 'move').css('opacity', '1');
        } else {
            // In normal mode, it's still draggable (to switch), but looks "aligned".
            // We keep cursor move to indicate "you can move this"
            $('#logo-proxy').css('cursor', 'grab').css('opacity', '0.9');
        }
    } catch (e) {
        console.error("jQuery UI Draggable not loaded", e);
    }
}

function updateTextPreview() {
    var prefixUse = $('#logo-prefix-use').is(':checked');
    var prefixText = $('#logo-prefix-text-val').val() || '';
    var prefixColor = $('#logo-prefix-color').val();
    var prefixSize = $('#logo-prefix-size-val').val();

    var lines = $('input[name="logo-lines"]:checked').val();
    var textHtml = '';

    // Build Main Text HTML
    var mainColor = $('#logo-text-color').val();
    var mainSize = $('#logo-text-size-val').val();
    var mainFont = $('#logo-text-font-val').val();
    var mainWeight = $('#logo-text-weight-val').val();
    var mainStyle = `color:${mainColor}; font-size:${mainSize}; font-family:${mainFont}; font-weight:${mainWeight};`;

    if (lines === '2') {
        var l1 = $('#logo-text-line1-val').val() || 'Line 1';
        var l2 = $('#logo-text-line2-val').val() || 'Line 2';
        textHtml = `<div style="display:flex; flex-direction:column; line-height:1.2; text-align:left; ${mainStyle}"><span>${l1}</span><span>${l2}</span></div>`;
    } else {
        var t = $('#logo-text-val').val() || 'Text';
        textHtml = `<span style="${mainStyle}">${t}</span>`;
    }

    // Build Prefix HTML
    var prefixHtml = '';
    if (prefixUse) {
        prefixHtml = `<span style="color:${prefixColor}; font-size:${prefixSize}; font-weight:900; margin-right:8px; font-family:'GmarketSansMedium', sans-serif;">${prefixText}</span>`;
    }

    // Combine
    $('#logo-preview-text').html(`<div style="display:flex; align-items:center; justify-content:center;">${prefixHtml}${textHtml}</div>`);
}

function togglePrefix() {
    if ($('#logo-prefix-use').is(':checked')) {
        $('#logo-prefix-text-val').closest('.form-group').show(); // Simplification
    }
    updateTextPreview();
}

function toggleLogoLines() {
    var lines = $('input[name="logo-lines"]:checked').val();
    if (lines === '2') {
        $('#logo-text-1line-group').hide();
        $('#logo-text-2line-group').show();
    } else {
        $('#logo-text-1line-group').show();
        $('#logo-text-2line-group').hide();
    }
    updateTextPreview();
}


// -- User Board (Online Applications) Logic --
function renderUserBoardList() {
    if (typeof BoardManager === 'undefined') {
        setTimeout(renderUserBoardList, 500);
        return;
    }

    var filter = document.getElementById('boardFilter') ? document.getElementById('boardFilter').value : 'all';

    // We should use .then() always as per BoardManager definition.
    BoardManager.getPosts().then(function (allPosts) {
        // [User Request] Warning removed.

        console.log("[DEBUG] All Fetched Posts form BoardManager:", allPosts);

        let filteredPosts = allPosts;
        if (filter !== 'all') {
            filteredPosts = allPosts.filter(function (p) { return p.boardCode === filter; });
        } else {
            // If 'all', maybe exclude other random boards? 
            // For now, let's just include inquiry and privacy.
            filteredPosts = allPosts.filter(function (p) {
                return p.boardCode === 'inquiry_board' || p.boardCode === 'privacy_log' || p.boardCode === 'inquiry_sub0701';
            });
        }

        filteredPosts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

        var html = '';

        if (filteredPosts.length === 0) {
            html = '<tr><td colspan="6" style="padding:40px; text-align:center; color:#999;">현재 접수된 내역이 없습니다. (No Data)</td></tr>';
        } else {
            filteredPosts.forEach(function (p) {
                // Formatting
                var name = p.authorName || 'Guest';
                var subject = p.details || p.course || p.subject;
                var dateStr = p.date;
                var badge = '<span style="display:inline-block; padding:4px 10px; border-radius:12px; font-size:11px; background:#f0f0f0; color:#666; font-weight:600;">일반접수</span>';

                // Distinct Badges
                if (p.boardCode === 'privacy_log') {
                    badge = '<span style="display:inline-block; padding:4px 10px; border-radius:12px; font-size:11px; background:#e6fffa; color:#2c7a7b; border:1px solid #b2f5ea; font-weight:600;">개인정보</span>';
                } else if (p.boardCode === 'inquiry_sub0701') {
                    badge = '<span style="display:inline-block; padding:4px 10px; border-radius:12px; font-size:11px; background:#ebf8ff; color:#2b6cb0; border:1px solid #bee3f8; font-weight:600;">상담신청</span>';
                }

                var phone = p.phone || '-';

                html += '<tr style="border-bottom:1px solid #eee;">';
                html += '<td style="padding:15px 10px; color:#555;">' + dateStr + '</td>';
                html += '<td style="padding:15px 10px;">' + badge + '</td>';
                html += '<td style="padding:15px 10px; font-weight:bold; color:#333;">' + name + '</td>';
                html += '<td style="padding:15px 10px;">' + subject + '</td>';
                html += '<td style="padding:15px 10px;">' + phone + '</td>';
                html += '<td style="padding:15px 10px; text-align:center;">';

                if (p.boardCode === 'privacy_log') {
                    html += '<button class="action-btn" style="background:#3182ce; color:white; padding:5px 10px; border-radius:4px; border:none; margin-right:5px; cursor:pointer;" onclick="downloadSingleAgreement(\'' + p.idx + '\')">증명서</button>';
                } else {
                    // html += '<button class="action-btn" style="background:#718096; color:white; padding:5px 10px; border-radius:4px; border:none; margin-right:5px; cursor:pointer;" onclick="alert(\'준비중입니다.\')">보기</button>';
                }

                html += '<button class="action-btn btn-remove" style="background:#e53e3e; color:white; padding:5px 10px; border-radius:4px; border:none; cursor:pointer;" onclick="deleteBoardPost(\'' + p.idx + '\')">삭제</button>';
                html += '</td>';
                html += '</tr>';
            });
        }
        var tbody = document.getElementById('user-board-list-body');
        if (tbody) tbody.innerHTML = html;
    });
}

function downloadSingleAgreement(idx) {
    BoardManager.getPosts().then(function (posts) {
        var p = posts.find(function (item) { return item.idx === idx; });
        if (!p) { alert('데이터를 찾을 수 없습니다.'); return; }

        var name = p.authorName || '';
        var phone = p.phone || '';
        var course = p.course || p.subject || '';
        var date = p.date;

        var htmlContent = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>개인정보 수집/이용 동의서 - ${name}</title>
                <style>
                    body { font-family: "Malgun Gothic", dotum, sans-serif; padding: 40px; background: #f0f0f0; }
                    .paper { background: white; width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); box-sizing: border-box; }
                    h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .info-table th, .info-table td { border: 1px solid #ccc; padding: 10px; }
                    .info-table th { background: #f9f9f9; width: 120px; }
                    .terms-box { border: 1px solid #333; padding: 20px; font-size: 13px; line-height: 1.6; margin-bottom: 30px; }
                    .check-box { text-align: right; font-size: 18px; font-weight: bold; margin-bottom: 50px; }
                    .signature { text-align: center; margin-top: 50px; font-size: 16px; }
                </style>
            </head>
            <body>
                <div class="paper">
                    <h1>개인정보 수집 및 이용 동의서 (상담용)</h1>
                    
                    <h3>1. 신청자 정보 (Applicant Info)</h3>
                    <table class="info-table">
                        <tr>
                            <th>성명</th>
                            <td>${name}</td>
                            <th>전화번호</th>
                            <td>${phone}</td>
                        </tr>
                        <tr>
                            <th>신청과목</th>
                            <td colspan="3">${course}</td>
                        </tr>
                        <tr>
                            <th>접수일자</th>
                            <td colspan="3">${date}</td>
                        </tr>
                    </table>

                    <h3>2. 개인정보 수집 및 이용 동의 (Agreement)</h3>
                    <div class="terms-box">
                        <strong>1. 개인정보의 수집 및 이용 목적</strong><br>
                        - 수강료 조회 및 교육과정 상담, 국비지원 자격 확인 및 안내, 상담 문의 답변<br><br>

                        <strong>3. 개인정보의 보유 및 이용 기간</strong><br>
                        - 상담 완료 후 1년간 보관하며, 이후 지체 없이 파기합니다.<br><br>

                        <strong>4. 동의 거부 권리 및 불이익</strong><br>
                        - 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 필수항목 수집에 동의하지 않으실 경우 상담 서비스 이용이 제한될 수 있습니다.
                    </div>

                    <div class="check-box">
                        [ ☑ ] 위 개인정보 수집 및 이용 약관에 동의합니다. (Agreed)
                    </div>

                    <div class="signature">
                        <p>${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일</p>
                        <br>
                        <p style="font-size:18px;">
                            신청자: <strong>${name}</strong> &nbsp;&nbsp;&nbsp; 
                            <span style="display:inline-block; position:relative; margin-left:10px;">
                                (인)
                                <span style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); min-width:60px; text-align:center;
                                                font-family:'gungsuh', Batang, serif; font-size:24px; font-weight:bold; 
                                                color:rgba(0,0,0,0.8); white-space:nowrap;">
                                    ${name}
                                </span>
                            </span>
                        </p>
                    </div>
                </div>
                <script>window.print();<\/script>
            </body>
            </html>
        `;

        var blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "동의서_" + name + "_" + date + ".html");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function downloadBoardExcel() {
    var filter = document.getElementById('boardFilter').value;
    BoardManager.getPosts().then(function (posts) {
        if (filter !== 'all') {
            posts = posts.filter(function (p) { return p.boardCode === filter; });
        } else {
            posts = posts.filter(function (p) {
                return p.boardCode === 'inquiry_board' || p.boardCode === 'privacy_log';
            });
        }
        posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

        var csvContent = "\uFEFF작성일,이름,과목/내용,전화번호,동의여부,문서구분\n";

        posts.forEach(function (p) {
            var date = p.date;
            var name = p.authorName || '';
            var subject = (p.course || '') + ' ' + (p.details || '');
            if (!p.course && !p.details) subject = p.subject; // Fallback
            subject = subject.replace(/,/g, ' ').replace(/\n/g, ' '); // Clean CSV

            var phone = p.phone || '';
            var type = (p.boardCode === 'privacy_log') ? '동의서(테스트문서)' : '수강문의';
            var agreed = '동의함'; // All saved posts are agreed

            csvContent += `${date},${name},${subject},${phone},${agreed},${type}\n`;
        });

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "수강접수_및_동의서_" + new Date().toISOString().slice(0, 10) + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function deleteBoardPost(idx) {
    if (confirm('정말 삭제하시겠습니까?')) {
        BoardManager.deletePost(idx).then(function (res) {
            alert(res.message);
            renderUserBoardList();
        });
    }
}


// -- Member Management Logic --
function renderUserList() {
    if (typeof AuthManager === 'undefined') {
        setTimeout(renderUserList, 500);
        return;
    }

    // Sync toggle if AuthManager supports it
    if (AuthManager.getAuthSettings) {
        var settings = AuthManager.getAuthSettings();
        $('#autoApproveCheck').prop('checked', settings.autoApprove);
    }

    var users = AuthManager.getAllUsers ? AuthManager.getAllUsers() : []; // Dummy or real
    // If Dummy AuthManager doesn't have getAllUsers, provide fallback
    if (!AuthManager.getAllUsers) {
        users = [
            { id: 'admin', name: '관리자', phone: '010-0000-0000', status: 'approved', level: 10 },
            { id: 'guest1', name: '홍길동', phone: '010-1234-5678', status: 'pending', level: 1 }
        ];
    }

    var html = '';
    users.forEach(function (u) {
        var statusClass = 'status-' + (u.status || 'pending');
        var statusText = u.status ? u.status.toUpperCase() : 'PENDING';

        html += '<tr style="border-bottom:1px solid #eee;">';
        html += '<td style="padding:10px;">' + u.id + '</td>';
        html += '<td style="padding:10px;">' + u.name + '</td>';
        html += '<td style="padding:10px;">' + (u.phone || '-') + '</td>';
        html += '<td style="padding:10px;"><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>';
        html += '<td style="padding:10px; text-align:center;">';
        if (u.status !== 'approved') {
            html += '<button class="action-btn" onclick="approveUser(\'' + u.id + '\')">승인</button>';
        }
        html += '<button class="action-btn btn-remove" onclick="deleteUser(\'' + u.id + '\')">삭제</button>';
        html += '</td>';
        html += '</tr>';
    });

    var tbody = document.getElementById('user-list-body');
    if (tbody) tbody.innerHTML = html;
}

function toggleAuto(checkbox) {
    if (AuthManager.setAuthSettings) {
        AuthManager.setAuthSettings({ autoApprove: checkbox.checked });
        alert('자동 승인 설정이 변경되었습니다.');
    } else {
        console.warn('AuthManager.setAuthSettings not available');
    }
}

function approveUser(userId) {
    if (AuthManager.approveUser) {
        AuthManager.approveUser(userId);
        alert('승인되었습니다.');
        renderUserList();
    } else {
        alert('기능이 지원되지 않습니다.');
    }
}

function deleteUser(userId) {
    if (confirm('정말 삭제하시겠습니까?')) {
        if (AuthManager.deleteUser) {
            AuthManager.deleteUser(userId);
            alert('삭제되었습니다.');
            renderUserList();
        } else {
            alert('삭제되었습니다. (Mock)');
            // Mock redraw to remove from dummy list temporarily if we were using a real state
            $('#user-list-body').find(`td:contains('${userId}')`).closest('tr').remove();
        }
    }
}

// -- Utility Functions --
let currentTargetInput = null;
let currentFileSelectCallback = null;

function stripHtml(html) {
    if (!html) return "";
    return html.replace(/<p>/g, "").replace(/<\/p>/g, "\n").trim();
}

function simulateFileSelect(inputId, callback = null) {
    currentTargetInput = inputId;
    currentFileSelectCallback = callback;

    // Safety check for the hidden input
    let hiddenInput = $('#hidden-file-input');
    if (hiddenInput.length === 0) {
        // Create if not exists (though admin.html should have it)
        $('body').append('<input type="file" id="hidden-file-input" style="display:none;">');
        hiddenInput = $('#hidden-file-input');
    }

    hiddenInput.off('change').on('change', function () {
        handleFileSelected(this);
    });
    hiddenInput.click();
}

function handleFileSelected(input) {
    if (input.files && input.files[0] && currentTargetInput) {
        const file = input.files[0];
        const fileName = file.name;
        // Mock path, normally this would be the result of upload
        const simulatedPath = `img_up/shop_pds/sejongcook/farm/${fileName}`;

        // 1. Update text input
        $(currentTargetInput).val(simulatedPath).trigger('change');

        // 2. Preview (Blob URL)
        const blobUrl = URL.createObjectURL(file);

        if (currentTargetInput === '#main-hero-bg-val') {
            $('#main-hero-preview').attr('src', blobUrl);
        } else if (currentTargetInput === '#header-img-val') {
            // No specific preview
        }

        // Custom callback
        if (currentFileSelectCallback) {
            currentFileSelectCallback(blobUrl);
        }
    }
}
// -- APPEND START --
// -- Core Admin Logic (Init, Config, Layout) --

function simulateBoardFileSelect(btn, type, index) {
    $('#hidden-file-input').off('change').on('change', function () {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const fileName = file.name;
            const simulatedPath = `img_up/shop_pds/sejongcook/farm/${fileName}`;
            const blobUrl = URL.createObjectURL(file);

            const $itemRow = $(btn).closest('.board-item, .slide-item, .q-image-row, .side-banner-item, .cat-item, .sub-item');
            $itemRow.find('.b-img, .s-src, .q-src, .side-src, .c-img, .sub-i-img').val(simulatedPath).trigger('change');
            $itemRow.find('.board-img-preview, .cat-img-preview, .slide-img-preview').attr('src', blobUrl);
        }
        this.value = '';
    });
    $('#hidden-file-input').click();
}

function setupDragAndDrop() {
    // Global delegation for drag & drop
    $(document).on('dragover', '.board-img-preview, .file-input-wrapper', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('drag-over');
    });

    $(document).on('dragleave', '.board-img-preview, .file-input-wrapper', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');
    });

    $(document).on('drop', '.board-img-preview, .file-input-wrapper', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');

        const files = e.originalEvent.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileName = file.name;
            const simulatedPath = `img_up/shop_pds/sejongcook/farm/${fileName}`;
            const blobUrl = URL.createObjectURL(file);

            // Find context
            let $container = $(this).closest('.board-item, .slide-item, .qlink-item, .side-banner-item, .cat-item, .sub-item, .admin-section, .form-group');

            // Case 1: Dropped on Main Hero Preview or Input
            if ($(this).attr('id') === 'main-hero-preview' || $(this).attr('id') === 'main-hero-bg-val' || $(this).parent().find('#main-hero-bg-val').length) {
                $('#main-hero-bg-val').val(simulatedPath).trigger('change');
                $('#main-hero-preview').attr('src', blobUrl);
                return;
            }

            // Case 2: Dropped on Subpage Header
            if ($(this).parent().find('#header-img-val').length) {
                $('#header-img-val').val(simulatedPath).trigger('change');
                return;
            }

            // Case 3: Dropped on Logo Section
            if ($(this).closest('.admin-section').find('#logo-src-val').length) {
                $('#logo-src-val').val(simulatedPath).trigger('change');
                $('#logo-preview').attr('src', blobUrl);
                return;
            }

            // Case 4: List Items
            const $inputs = $container.find('.b-img, .s-src, .q-src, .side-src, .c-img, .sub-i-img');
            const $previews = $container.find('.board-img-preview, .cat-img-preview, .slide-img-preview');

            if ($inputs.length) {
                $inputs.val(simulatedPath).trigger('change');
            }
            if ($previews.length) {
                $previews.attr('src', blobUrl);
            }
        }
    });
}

function initAdmin() {
    setupDragAndDrop();
    // Backup defaults
    // Check if siteContent is defined
    if (typeof siteContent === 'undefined') {
        console.warn('siteContent is undefined in initAdmin. Skipping.');
        return;
    }
    const pristineSiteContent = JSON.parse(JSON.stringify(siteContent));
    const defaultSiteContent = JSON.parse(JSON.stringify(siteContent));

    const savedData = localStorage.getItem('sejongcook_admin_config_v2');
    if (savedData) {
        try {
            const savedConfig = JSON.parse(savedData);

            function smartMerge(target, source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (Array.isArray(source[key])) {
                            target[key] = source[key];
                        } else if (typeof source[key] === 'object' && source[key] !== null) {
                            if (!target[key]) {
                                target[key] = source[key];
                            } else {
                                smartMerge(target[key], source[key]);
                            }
                        } else {
                            target[key] = source[key];
                        }
                    }
                }
                return target;
            }

            smartMerge(defaultSiteContent, savedConfig);
            siteContent = defaultSiteContent;
            console.log('Restored config from localStorage (Smart Merged)');
        } catch (e) {
            console.error('Failed to restore from localStorage', e);
        }
    }

    // Ensure Defaults
    if (!siteContent.quickLinks || siteContent.quickLinks.length === 0) {
        siteContent.quickLinks = pristineSiteContent.quickLinks;
    } else if (siteContent.quickLinks.length < 6) {
        if (!siteContent.quickLinks[0] || siteContent.quickLinks[0].title === "New Card") {
            siteContent.quickLinks = defaultSiteContent.quickLinks;
        }
    }

    if (!siteContent.heroButtons) {
        siteContent.heroButtons = { primary: { text: "과정리뷰하기", link: "page/sub0201.html" }, secondary: { text: "상담문의", link: "bbs/sub0602.html" } };
    }

    if (!siteContent.sectionHeaders) {
        siteContent.sectionHeaders = { middle: { title: "전문가를 위한 체계적인 교육과정", subtitle: "기초부터 심화까지, 당신에게 딱 맞는 커리큘럼을 만나보세요." }, bottom: { title: "Latest Updates", subtitle: "세종요리제과기술학원의 새로운 소식입니다." } };
    }

    if (!siteContent.logo) {
        siteContent.logo = { src: "img/logo.png", alt: "세종요리제과기술학원", width: "200px", align: "left" };
    }

    if (!siteContent.footerInfo) {
        siteContent.footerInfo = { address: "경기 김포시 김포대로 841 제우스 프라자 6층", tel: "031-982-0303", fax: "031-986-1933", ceo: "오재을", bizNum: "137-86-35783", copyright: "Copyright &copy; 2004 Sejong Culinary Art School. All Rights Reserved." };
    }

    // QuickLinks Title Migration
    if (siteContent.quickLinks && Array.isArray(siteContent.quickLinks)) {
        siteContent.quickLinks.forEach(function (item) { if (!item.title && item.alt) { item.title = item.alt; } });
    }

    // Populate Fields
    $('#intro-title-val').val(siteContent.introText.title);
    $('#intro-line1-val').val(siteContent.introText.lines[0]);
    $('#intro-line2-val').val(siteContent.introText.lines[1]);

    // Auth Links Toggle
    if (siteContent.headerConfig && siteContent.headerConfig.showAuthLinks !== undefined) {
        $('#show-auth-links-toggle').prop('checked', siteContent.headerConfig.showAuthLinks);
    } else {
        // Default to false if not set
        $('#show-auth-links-toggle').prop('checked', false);
    }

    if (siteContent.mainHero) {
        $('#main-hero-title-val').val(siteContent.mainHero.title);
        $('#main-hero-desc-val').val(siteContent.mainHero.subtitle);
        $('#main-hero-badge-val').val(siteContent.mainHero.badgeText || "Premium Culinary Academy");
        $('#main-hero-long-desc-val').val(siteContent.mainHero.description || "최고의 강사진과 최신설비로 여러분의 꿈을 현실로 만들어드립니다.\\n자격증 취득부터 창업까지, 전문가가 함께합니다.");

        var images = siteContent.mainHero.images || [];
        if (images.length === 0 && siteContent.mainHero.bgImage) { images.push(siteContent.mainHero.bgImage); }

        $('#hero-img-1').val(images[0] || '').trigger('input');
        $('#hero-img-2').val(images[1] || '').trigger('input');
        $('#hero-img-3').val(images[2] || '').trigger('input');
        $('#hero-img-4').val(images[3] || '').trigger('input');
        $('#hero-img-5').val(images[4] || '').trigger('input');
        $('#hero-img-6').val(images[5] || '').trigger('input');

        if (images[0]) $('#hero-preview-1').attr('src', images[0]);
        if (images[1]) $('#hero-preview-2').attr('src', images[1]);
        if (images[2]) $('#hero-preview-3').attr('src', images[2]);
        if (images[3]) $('#hero-preview-4').attr('src', images[3]);
        if (images[4]) $('#hero-preview-5').attr('src', images[4]);
        if (images[5]) $('#hero-preview-6').attr('src', images[5]);
    }

    if (siteContent.heroButtons) {
        $('#hero-btn1-text').val(siteContent.heroButtons.primary.text);
        $('#hero-btn1-link').val(siteContent.heroButtons.primary.link);
        $('#hero-btn2-text').val(siteContent.heroButtons.secondary.text);
        $('#hero-btn2-link').val(siteContent.heroButtons.secondary.link);
    }

    if (siteContent.heroPhone) {
        $('#hero-phone-visible').prop('checked', siteContent.heroPhone.visible !== false);
        $('#hero-phone-number').val(siteContent.heroPhone.number || '');
        $('#hero-phone-size').val(siteContent.heroPhone.fontSize || '32px');
        $('#hero-phone-icon').val(siteContent.heroPhone.icon || '📞');
        $('#hero-phone-border-color').val(siteContent.heroPhone.borderColor || '#ffa200');
        $('#hero-phone-border-color-hex').val(siteContent.heroPhone.borderColor || '#ffa200');
    } else {
        $('#hero-phone-visible').prop('checked', true);
        $('#hero-phone-number').val('031-983-9133');
    }

    if (siteContent.sectionHeaders) {
        if (siteContent.sectionHeaders.middle) {
            $('#sec-mid-title').val(siteContent.sectionHeaders.middle.title);
            $('#sec-mid-desc').val(siteContent.sectionHeaders.middle.subtitle);
        }
        if (siteContent.sectionHeaders.bottom) {
            $('#sec-bot-title').val(siteContent.sectionHeaders.bottom.title);
            $('#sec-bot-desc').val(siteContent.sectionHeaders.bottom.subtitle);
        }
    }

    if (siteContent.logo) {
        var type = siteContent.logo.type || 'image';
        $('input[name="logo-type"][value="' + type + '"]').prop('checked', true);

        $('#logo-src-val').val(siteContent.logo.src);
        $('#logo-alt-val').val(siteContent.logo.alt);
        $('#logo-preview-img').attr('src', siteContent.logo.src);

        var wVal = siteContent.logo.width || '200px';
        var wNum = parseInt(wVal.replace('px', '')) || 200;
        $('#logo-width-val').val(wNum);
        $('#logo-width-display').text(wNum + 'px');
        $('#logo-preview-img').css('width', wNum + 'px');

        var lLines = siteContent.logo.textLines || '1';
        $('input[name="logo-lines"][value="' + lLines + '"]').prop('checked', true);

        $('#logo-text-val').val(siteContent.logo.text || '세종요리제과기술학원');
        $('#logo-text-line1-val').val(siteContent.logo.textLine1 || '');
        $('#logo-text-line2-val').val(siteContent.logo.textLine2 || '');
        $('#logo-text-color').val(siteContent.logo.textColor || '#333333');
        $('#logo-text-color-hex').val(siteContent.logo.textColor || '#333333');
        $('#logo-text-size-val').val(siteContent.logo.textSize || '24px');
        $('#logo-text-font-val').val(siteContent.logo.textFont || "'Noto Sans KR', sans-serif");
        $('#logo-text-weight-val').val(siteContent.logo.textWeight || 'bold');

        $('#logo-prefix-use').prop('checked', siteContent.logo.prefixUse !== false);
        $('#logo-prefix-text-val').val(siteContent.logo.prefixText || 'SJ');
        $('#logo-prefix-color').val(siteContent.logo.prefixColor || '#ff8a00');
        $('#logo-prefix-color-hex').val(siteContent.logo.prefixColor || '#ff8a00');
        $('#logo-prefix-size-val').val(siteContent.logo.prefixSize || '40px');

        toggleLogoLines();
        updateTextPreview();

        var pMode = siteContent.logo.posMode || 'normal';
        $('input[name="logo-pos-mode"][value="' + pMode + '"]').prop('checked', true);

        $('#logo-top-val').val(siteContent.logo.top || '0px');
        $('#logo-left-val').val(siteContent.logo.left || '0px');
        $('#logo-zindex-val').val(siteContent.logo.zIndex || '100');

        $('#logo-proxy').css({ top: siteContent.logo.top || '0px', left: siteContent.logo.left || '0px' });
        toggleLogoPosition();

        $('#logo-align-val').val(siteContent.logo.align || 'left');
        toggleLogoMode();
    }

    if (siteContent.footerInfo) {
        $('#footer-address').val(siteContent.footerInfo.address);
        $('#footer-tel').val(siteContent.footerInfo.tel);
        $('#footer-fax').val(siteContent.footerInfo.fax);
        $('#footer-ceo').val(siteContent.footerInfo.ceo);
        $('#footer-biznum').val(siteContent.footerInfo.bizNum || '');
        $('#footer-copyright').val(siteContent.footerInfo.copyright || '');
    }

    if (siteContent.cardGridStyle) {
        $('#card-grid-columns').val(siteContent.cardGridStyle.columns || 3);
        $('#card-grid-align').val(siteContent.cardGridStyle.textAlign || 'left');

        var hVal = siteContent.cardGridStyle.cardHeight || '400px';
        var hNum = parseInt(hVal.replace('px', '')) || 400;
        $('#card-grid-height').val(hNum);
        $('#card-grid-height-val').text(hNum + 'px');

        $('#card-grid-title-color').val(siteContent.cardGridStyle.titleColor || '#333333');
        $('#card-grid-title-color-hex').val(siteContent.cardGridStyle.titleColor || '#333333');
        $('#card-grid-desc-color').val(siteContent.cardGridStyle.descColor || '#666666');
        $('#card-grid-desc-color-hex').val(siteContent.cardGridStyle.descColor || '#666666');
        $('#card-grid-bg-color').val(siteContent.cardGridStyle.cardBg || '#ffffff');
        $('#card-grid-bg-color-hex').val(siteContent.cardGridStyle.cardBg || '#ffffff');
        $('#card-grid-title-size').val(siteContent.cardGridStyle.titleSize || '1.4rem');
        $('#card-grid-desc-size').val(siteContent.cardGridStyle.descSize || '15px');
    }

    renderSlidesList();
    renderQuickLinksList();
    renderSideBannersList();
    renderFloatMenuList();
    renderSitemapGrid();

    // Sub-page editing listeners
    $('#subpage-title-val, #header-img-val').on('input change', function () {
        var pageId = $('#subpage-selector').val();
        if (pageId && siteContent.subPages[pageId]) {
            siteContent.subPages[pageId].title = $('#subpage-title-val').val();
            siteContent.subPages[pageId].topImage = $('#header-img-val').val();
            renderSitemapGrid();
        }
    });

    $('#subpage-html-val').on('input change', function () {
        var pageId = $('#subpage-selector').val();
        if (pageId && siteContent.subPages[pageId]) {
            var text = $(this).val();
            var html = text.split('\n').filter(line => line.trim() !== '').map(line => `<p>${line}</p>`).join('');
            siteContent.subPages[pageId].htmlContent = html;
        }
    });
} // End initAdmin

function loadSubPageData() {
    var pageId = $('#subpage-selector').val();
    if (!pageId) {
        $('#subpage-editor').hide();
        $('#subpage-slides-section').hide();
        return;
    }

    var isCategoryMainPage = /^sub0[1-6]$/.test(pageId);
    var pageData = siteContent.subPages[pageId];

    if (pageData) {
        // Update Section Header for clarity
        $('#edit-area-title').text(pageData.title + ' 편집');
        $('#current-page-id').text('ID: ' + pageId);

        $('#subpage-title-val').val(pageData.title);
        $('#header-img-val').val(pageData.topImage);

        // Init Summernote (Destroy previous instance first to avoid duplication)
        $('#subpage-html-val').summernote('destroy');
        $('#subpage-html-val').val(pageData.htmlContent || ""); // Set value for source
        $('#subpage-html-val').summernote({
            height: 300,
            lang: 'ko-KR', // Defaults to EN if KO not loaded, but that's fine
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather', 'Noto Sans KR', 'Eraser'],
            fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36']
        });
        // $('#subpage-html-val').summernote('code', pageData.htmlContent || ""); // Alternative set method
        renderSubPageItemsList(pageData.items || []);

        // Always show Board Config Section (User request: Allow board settings for all pages)
        // Only Slides section remains conditional for category main pages
        if (isCategoryMainPage) {
            renderSubPageSlidesList(pageData.slides || []);
            $('#subpage-slides-section').show();
        } else {
            $('#subpage-slides-section').hide();
        }

        var boardConfig = pageData.boardConfig || { enable: false, title: "게시판", count: 5 };
        $('#subpage-board-enable').prop('checked', boardConfig.enable);
        $('#subpage-board-title').val(boardConfig.title || "게시판");
        $('#subpage-board-count').val(boardConfig.count || 5);
        $('#subpage-board-section').show(); // Always show

        $('#subpage-editor').show();
    } else {
        siteContent.subPages[pageId] = { title: "", topImage: "", htmlContent: "", items: [], slides: [], boardConfig: { enable: false, title: "게시판", count: 5 } };
        $('#subpage-title-val').val("");
        $('#header-img-val').val("");
        // Init Summernote for New Page
        $('#subpage-html-val').summernote('destroy');
        $('#subpage-html-val').val("");
        $('#subpage-html-val').summernote({
            height: 300,
            lang: 'ko-KR',
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather', 'Noto Sans KR', 'Eraser'],
            fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36']
        });
        $('#subpage-items-list').empty();
        $('#subpage-slides-list').empty();
        $('#subpage-board-enable').prop('checked', false);
        $('#subpage-board-title').val("게시판");
        $('#subpage-board-count').val(5);

        if (isCategoryMainPage) {
            $('#subpage-slides-section').show();
            $('#subpage-board-section').show();
        } else {
            $('#subpage-slides-section').hide();
            $('#subpage-board-section').hide();
        }
        $('#subpage-editor').show();
    }
}

// Event Listeners for Board Config
$('#subpage-board-enable, #subpage-board-title, #subpage-board-count').on('change input', function () {
    var pageId = $('#subpage-selector').val();
    if (pageId && siteContent.subPages[pageId]) {
        siteContent.subPages[pageId].boardConfig = {
            enable: $('#subpage-board-enable').is(':checked'),
            title: $('#subpage-board-title').val(),
            count: parseInt($('#subpage-board-count').val()) || 5
        };
    }
});

$('#subpage-selector').on('change', function () {
    loadSubPageData();
});

function renderSubPageItemsList(items) {
    const container = $('#subpage-items-list');
    container.empty();

    if (!items || items.length === 0) {
        container.html('<div onclick="window.addSubPageItem()"' +
            ' style="text-align:center; padding:40px; color:#555; border:2px dashed #bbb; border-radius:8px; cursor:pointer; background:#f9f9f9; transition:all 0.2s;"' +
            ' onmouseover="this.style.background=\'#eef6ff\'; this.style.borderColor=\'#007bff\'"' +
            ' onmouseout="this.style.background=\'#f9f9f9\'; this.style.borderColor=\'#bbb\'">' +
            '<div onclick="window.addSubPageItem(); event.stopPropagation();" style="font-size:32px; margin-bottom:10px; color:#007bff; animation: pulse-soft 2s infinite ease-in-out;">⊕</div>' +
            '<strong onclick="window.addSubPageItem(); event.stopPropagation();" style="font-size:16px; color:#333;">등록된 아이템이 없습니다.</strong><br>' +
            '<span onclick="window.addSubPageItem(); event.stopPropagation();" style="font-size:12px; color:#666; display:inline-block; margin-top:5px; background:#fff; padding:5px 10px; border-radius:15px; border:1px solid #ddd;">👉 여기를 눌러 아이템을 추가하세요!</span>' +
            '</div>');
        return;
    }

    items.forEach((item, index) => {
        let editorHtml = '';

        // Determine Editor Type based on properties or defaults (fallback to card logic)
        // Detect Type
        const isTable = item.htmlContent !== undefined; // Table has htmlContent
        const isLink = item.link !== undefined; // Link has link
        const isTextOnly = item.img === "" && !isTable && !isLink;
        const isPhotoOnly = (item.title === "" && item.desc === "" && item.img !== "");

        if (isTable) {
            // --- TABLE EDITOR ---
            editorHtml = `
            <div class="board-item sub-item" data-index="${index}" style="display: grid; grid-template-columns: 1fr; gap: 10px; padding: 15px; background: #fff; border: 1px solid #eee; border-left: 4px solid #2ecc71; border-radius: 8px; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:#2ecc71;">📊 표 (Table)</strong>
                    <button class="btn-remove" onclick="removeSubPageItem(${index})" style="font-size:11px; padding:2px 5px;">삭제</button>
                </div>
                <input type="text" placeholder="제목 (선택사항)" value="${item.title || ''}" class="sub-i-title" style="font-weight:bold; font-size:14px; width:100%;">
                
                <label style="font-size:11px; color:#666;">HTML 코드 편집:</label>
                <textarea class="sub-i-html" style="width:100%; height:120px; font-family:monospace; font-size:12px; border:1px solid #ddd; padding:5px; background:#fcfcfc;">${item.htmlContent || ''}</textarea>
                <div style="font-size:11px; color:#999;">* HTML 태그를 직접 편집하여 표를 구성하세요.</div>
            </div>`;

        } else if (isLink) {
            // --- LINK EDITOR ---
            editorHtml = `
            <div class="board-item sub-item" data-index="${index}" style="display: grid; grid-template-columns: 1fr; gap: 10px; padding: 15px; background: #fff; border: 1px solid #eee; border-left: 4px solid #3498db; border-radius: 8px; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:#3498db;">🔗 링크 (Link/Buttons)</strong>
                    <button class="btn-remove" onclick="removeSubPageItem(${index})" style="font-size:11px; padding:2px 5px;">삭제</button>
                </div>
                <input type="text" placeholder="링크 제목 (예: 수강신청 바로가기)" value="${item.title || ''}" class="sub-i-title" style="font-weight:bold; font-size:14px; width:100%;">
                <input type="text" placeholder="설명 (선택사항)" value="${item.desc || ''}" class="sub-i-desc" style="width:100%; font-size:12px;">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:11px; color:#666;">이동할 주소 (URL/File):</label>
                        <input type="text" placeholder="http://... 또는 bbs/sub..." value="${item.link || ''}" class="sub-i-link" style="width:100%;">
                    </div>
                    <div>
                        <label style="font-size:11px; color:#666;">버튼 텍스트:</label>
                        <input type="text" placeholder="예: 바로가기 >" value="${item.linkText || ''}" class="sub-i-link-text" style="width:100%;">
                    </div>
                </div>
            </div>`;

        } else if (isTextOnly) {
            // --- TEXT-ONLY EDITOR ---
            editorHtml = `
            <div class="board-item sub-item" data-index="${index}" style="display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 15px; background: #fff; border: 1px solid #eee; border-left: 4px solid #f39c12; border-radius: 8px; margin-bottom: 10px;">
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#f39c12;">📝 텍스트 (Text Only)</strong>
                        <button class="btn-remove" onclick="removeSubPageItem(${index})" style="font-size:11px; padding:2px 5px;">삭제</button>
                    </div>
                    <input type="text" placeholder="아이템 제목 (예: 공지사항)" value="${item.title || ''}" class="sub-i-title" style="font-weight:bold; font-size:14px; width:100%;">
                    <textarea placeholder="아이템 설명 (간단한 소개)" class="sub-i-desc" style="resize:vertical; height:80px; font-size:12px; border:1px solid #ddd; padding:5px; width:100%;">${item.desc || ''}</textarea>
                </div>
            </div>`;

        } else if (isPhotoOnly) {
            // --- PHOTO-ONLY EDITOR ---
            editorHtml = `
            <div class="board-item sub-item" data-index="${index}" style="display: grid; grid-template-columns: 100px 1fr auto; gap: 10px; padding: 15px; background: #fff; border: 1px solid #eee; border-left: 4px solid #9b59b6; border-radius: 8px; margin-bottom: 10px; align-items:center;">
                <div style="grid-row: span 2;">
                    <img src="${item.img || ''}" class="board-img-preview" onerror="this.src='img/no_image.png'" style="width:80px; height:80px; object-fit:cover; border-radius:4px; background:#f5f5f5;">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <strong style="color:#9b59b6;">🖼️ 이미지 (Photo Only)</strong>
                    <input type="text" placeholder="이미지 URL" value="${item.img || ''}" class="sub-i-img" style="width:100%; font-size:12px;">
                </div>
                <div style="grid-row: span 2; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">
                    <button class="btn-remove" onclick="removeSubPageItem(${index})" style="font-size:11px; padding:2px 5px;">삭제</button>
                    <button class="btn-file" onclick="simulateSubItemFileSelect(this)" style="font-size:11px; padding:2px 5px;">파일</button>
                </div>
            </div>`;

        } else {
            // --- STANDARD CARD EDITOR (Default) ---
            editorHtml = `
            <div class="board-item sub-item" data-index="${index}" style="display: grid; grid-template-columns: 80px 1fr auto; gap: 10px; padding: 15px; background: #fff; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="grid-row: span 2;">
                    <img src="${item.img || ''}" class="board-img-preview" onerror="this.src='img/no_image.png'" style="width:80px; height:80px; object-fit:cover; border-radius:4px; background:#f5f5f5;">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <input type="text" placeholder="아이템 제목 (예: 커리큘럼)" value="${item.title || ''}" class="sub-i-title" style="font-weight:bold; font-size:14px;">
                    <textarea placeholder="아이템 설명 (간단한 소개)" class="sub-i-desc" style="resize:none; height:45px; font-size:12px; border:1px solid #ddd; padding:5px;">${item.desc || ''}</textarea>
                </div>
                <div style="grid-row: span 2; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">
                    <button class="btn-remove" onclick="removeSubPageItem(${index})" style="font-size:11px; padding:2px 5px;">삭제</button>
                    <div class="file-input-wrapper" style="width:auto;">
                        <input type="text" placeholder="이미지 URL" value="${item.img || ''}" class="sub-i-img" style="width:100px; font-size:11px;">
                        <button class="btn-file" onclick="simulateSubItemFileSelect(this)" style="font-size:11px; padding:2px 5px;">파일</button>
                    </div>
                </div>
            </div>
            `;
        }

        container.append(editorHtml);
    });
}

function simulateSubItemFileSelect(btn) {
    showImageGalleryModal(function (selectedPath) {
        const $item = $(btn).closest('.sub-item');
        $item.find('.sub-i-img').val(selectedPath);
        $item.find('.board-img-preview').attr('src', selectedPath);
    });
}
// -- Part 2 Content --
function addSubPageItem() {
    var pageId = $('#subpage-selector').val();
    if (!pageId) {
        alert("좌측의 [페이지 목록]에서 편집할 페이지를 먼저 클릭해주세요!\n(예: '학원소개' 또는 하위 메뉴 클릭)");
        var $list = $('#subpage-list-container').parent();
        $list.css('border', '2px solid red');
        setTimeout(function () { $list.css('border', '1px solid #ddd'); }, 300);
        setTimeout(function () { $list.css('border', '2px solid red'); }, 600);
        setTimeout(function () { $list.css('border', '1px solid #ddd'); }, 900);
        return;
    }
    // Show Item Type Modal
    $('#item-type-modal').fadeIn(200);
}

function addItemFromType(type) {
    $('#item-type-modal').fadeOut(200);
    var pageId = $('#subpage-selector').val();
    if (!pageId) return;

    if (!siteContent.subPages[pageId]) siteContent.subPages[pageId] = { items: [] };
    if (!siteContent.subPages[pageId].items) siteContent.subPages[pageId].items = [];

    var newItem = { title: "", desc: "", img: "" };

    if (type === 'card') {
        newItem.title = "새 과정/아이템";
        newItem.desc = "설명을 입력하세요.";
        newItem.img = "img/main_new.jpg";
    } else if (type === 'text') {
        newItem.title = "공지/안내";
        newItem.desc = "이미지 없는 텍스트 설명입니다.";
        newItem.img = "";
    } else if (type === 'photo') {
        newItem.title = "";
        newItem.desc = "";
        newItem.img = "img/no_image.png";
    } else if (type === 'table') {
        newItem.title = "표 (Table)";
        newItem.desc = "";
        newItem.htmlContent = `<table style="width:100%; border-collapse:collapse; margin-top:10px;">
    <thead>
        <tr>
            <th style="border:1px solid #ddd; padding:8px; background:#f5f5f5;">항목 1</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f5f5f5;">항목 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border:1px solid #ddd; padding:8px;">내용 1</td>
            <td style="border:1px solid #ddd; padding:8px;">내용 2</td>
        </tr>
    </tbody>
</table>`;
    } else if (type === 'link') {
        newItem.title = "외부 링크";
        newItem.desc = "관련 사이트로 이동합니다.";
        newItem.link = "http://";
        newItem.linkText = "자세히 보기 >";
    } else if (type === 'board_link') {
        newItem.title = "게시판 바로가기";
        newItem.desc = "공지사항 게시판으로 이동";
        newItem.link = "bbs/sub0601.html";
        newItem.linkText = "게시판 이동";
    }

    siteContent.subPages[pageId].items.push(newItem);
    renderSubPageItemsList(siteContent.subPages[pageId].items);

    setTimeout(function () {
        var $container = $('#subpage-items-list');
        if ($container.length) $container.scrollTop($container[0].scrollHeight);
    }, 100);
}

// --- Image Gallery Picker Logic ---
var galleryCallback = null;
function showImageGalleryModal(callback) {
    galleryCallback = callback;
    $('#image-gallery-modal').fadeIn(200);
    renderGalleryGrid();
}

function renderGalleryGrid() {
    var $grid = $('#gallery-grid');
    if ($grid.children().length > 0) return;

    var samples = [
        "img_up/shop_pds/sejongcook/design/img/main/hero_modern.png",
        "img_up/shop_pds/sejongcook/farm/cus1585903467.png",
        "img_up/shop_pds/sejongcook/design/img/main/brunch_01.png",
        "img_up/shop_pds/sejongcook/design/img/main/pasta_01.png",
        "img_up/shop_pds/sejongcook/design/img/main/baking_01.png",
        "img/icon_blog.png",
        "img/icon_insta.png",
        "img/logo.png",
        "img/main_new.jpg"
    ];

    samples.forEach(path => {
        var $img = $(`<div class="gallery-item-thumb" style="cursor:pointer; border:2px solid transparent; border-radius:4px; overflow:hidden; position:relative;">
            <img src="${path}" style="width:100%; height:80px; object-fit:cover; display:block;" onerror="this.src='img/no_image.png'">
            <div style="font-size:10px; color:#555; text-align:center; padding:2px; background:#f9f9f9; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${path.split('/').pop()}</div>
        </div>`);

        $img.hover(function () { $(this).css('border-color', '#007bff'); }, function () { $(this).css('border-color', 'transparent'); });

        $img.click(function () {
            if (galleryCallback) galleryCallback(path);
            $('#image-gallery-modal').fadeOut(200);
        });

        $grid.append($img);
    });
}

function removeSubPageItem(index) {
    var pageId = $('#subpage-selector').val();
    if (!pageId) return;

    if (confirm('정말 이 아이템을 삭제하시겠습니까?')) {
        siteContent.subPages[pageId].items.splice(index, 1);
        renderSubPageItemsList(siteContent.subPages[pageId].items);
    }
}

// Slide Management Functions
function renderSubPageSlidesList(slides) {
    const container = $('#subpage-slides-list');
    container.empty();
    slides.forEach((slide, index) => {
        const itemHtml = `
            <div class="slide-item" data-index="${index}" style="display: grid; grid-template-columns: 100px 1fr 150px 200px auto; gap: 10px; margin-bottom: 20px; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 8px; align-items: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);">
                <img src="${slide.src || ''}" class="board-img-preview" onerror="this.src='img/no_image.png'" style="width: 100px; height: 60px; object-fit: cover; background: #eee; border-radius: 4px;">
                <div class="file-input-wrapper" style="display: flex; gap: 5px; align-items: center;">
                    <input type="text" placeholder="이미지 경로" value="${slide.src || ''}" class="slide-src" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    <button class="btn-file" onclick="simulateSlideFileSelect(this)" style="white-space: nowrap; padding: 4px 8px; font-size: 12px; cursor: pointer; background: #eee; border: 1px solid #ccc; border-radius: 4px;">파일 선택</button>
                </div>
                <input type="text" placeholder="설명 (alt)" value="${slide.alt || ''}" class="slide-alt" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                <input type="text" placeholder="링크 (선택사항)" value="${slide.link || ''}" class="slide-link" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                <button class="btn-remove" onclick="removeSubPageSlide(${index})" style="background-color: var(--admin-danger); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">삭제</button>
            </div>
        `;
        container.append(itemHtml);
    });
}

function addSubPageSlide() {
    var pageId = $('#subpage-selector').val();
    if (!pageId) return;
    if (!siteContent.subPages[pageId].slides) siteContent.subPages[pageId].slides = [];

    siteContent.subPages[pageId].slides.push({
        src: "",
        alt: "슬라이드 이미지",
        link: "",
        target: "_self"
    });
    renderSubPageSlidesList(siteContent.subPages[pageId].slides);
}

function removeSubPageSlide(index) {
    var pageId = $('#subpage-selector').val();
    if (!pageId) return;
    if (confirm('이 슬라이드를 삭제하시겠습니까?')) {
        siteContent.subPages[pageId].slides.splice(index, 1);
        renderSubPageSlidesList(siteContent.subPages[pageId].slides);
    }
}

function simulateSlideFileSelect(btn) {
    $('#hidden-file-input').off('change').on('change', function () {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            const simulatedPath = `img_up/shop_pds/sejongcook/farm/${fileName}`;
            const $item = $(btn).closest('.slide-item');
            $item.find('.slide-src').val(simulatedPath);
            $item.find('.board-img-preview').attr('src', simulatedPath);
        }
        this.value = '';
    });
    $('#hidden-file-input').click();
}

function addItem(type) {
    if (type === 'slides') {
        if (!siteContent.heroSlides) siteContent.heroSlides = [];
        siteContent.heroSlides.push({
            src: "img/main/slider_01.jpg",
            alt: "New Slide",
            buttonText: "자세히 보기",
            link: "#"
        });
        renderSlidesList();
    } else if (type === 'quicklinks') {
        if (!siteContent.quickLinks) siteContent.quickLinks = [];
        siteContent.quickLinks.push({
            src: "img/main_new.jpg",
            images: ["img/main_new.jpg"],
            title: "New Card",
            desc: "Card Description",
            link: "#",
            alt: "New Card"
        });
        renderQuickLinksList();
    }
}

function removeSlide(index) {
    if (confirm('정말 삭제하시겠습니까?')) {
        siteContent.heroSlides.splice(index, 1);
        renderSlidesList();
    }
}

function removeQuickLink(index) {
    if (confirm('정말 삭제하시겠습니까?')) {
        siteContent.quickLinks.splice(index, 1);
        renderQuickLinksList();
    }
}

function addQuickLinkImage(index) {
    if (!siteContent.quickLinks[index].images) {
        siteContent.quickLinks[index].images = [];
        if (siteContent.quickLinks[index].src) siteContent.quickLinks[index].images.push(siteContent.quickLinks[index].src);
    }
    siteContent.quickLinks[index].images.push("img/no_image.png");
    renderQuickLinksList();
}

function removeQuickLinkImage(linkIndex, imgIndex) {
    if (siteContent.quickLinks[linkIndex].images && siteContent.quickLinks[linkIndex].images.length > 0) {
        siteContent.quickLinks[linkIndex].images.splice(imgIndex, 1);
        // Sync src with first image if exists
        siteContent.quickLinks[linkIndex].src = siteContent.quickLinks[linkIndex].images[0] || "";
        renderQuickLinksList();
    }
}

function renderSlidesList() {
    const container = $('#slides-list');
    container.empty();
    siteContent.heroSlides.forEach((slide, index) => {
        const itemHtml = `
            <div class="slide-item" data-index="${index}">
                <img src="${slide.src || ''}" class="board-img-preview" onerror="this.src='img/no_image.png'">
                <div class="file-input-wrapper">
                    <input type="text" placeholder="이미지 URL" value="${slide.src}" class="s-src" style="flex:1;">
                    <button class="btn-file" onclick="simulateBoardFileSelect(this)">파일 선택</button>
                </div>
                <input type="text" placeholder="설명 (alt)" value="${slide.alt}" class="s-alt">
                <div style="grid-column: span 2; display: flex; gap: 5px;">
                    <input type="text" placeholder="버튼 텍스트" value="${slide.buttonText || ''}" class="s-btn-text" style="flex: 1;">
                    <input type="text" placeholder="버튼 링크" value="${slide.link || ''}" class="s-link" style="flex: 2;">
                    <button class="btn-remove" onclick="removeSlide(${index})">삭제</button>
                </div>
            </div>
        `;
        container.append(itemHtml);
    });
}

function moveQuickLink(index, direction) {
    if (!siteContent.quickLinks) return;
    var newIndex = index + direction;
    if (newIndex < 0 || newIndex >= siteContent.quickLinks.length) return;
    var temp = siteContent.quickLinks[index];
    siteContent.quickLinks[index] = siteContent.quickLinks[newIndex];
    siteContent.quickLinks[newIndex] = temp;
    renderQuickLinksList();
}

function renderQuickLinksList() {
    const container = $('#quicklinks-list');
    container.empty();

    // Generate Sub-Page Options for the Selector
    let pageOptions = '<option value="">-- 연결할 페이지 선택 --</option>';
    var categories = { 'sub01': '학원소개', 'sub02': '제과제빵과정', 'sub03': '조리교육과정', 'sub04': '자격증&진학', 'sub05': '취업정보', 'sub06': '커뮤니티' };

    Object.keys(categories).forEach(catCode => {
        let catName = (siteContent.subPages[catCode] && siteContent.subPages[catCode].title) ? siteContent.subPages[catCode].title : categories[catCode];
        pageOptions += `<optgroup label="${catName}">`;
        pageOptions += `<option value="page/${catCode}.html" data-title="${catName}" data-img="">📁 ${catName} (메인)</option>`;
        Object.keys(siteContent.subPages).sort().forEach(key => {
            if (key.startsWith(catCode) && key !== catCode && key.length > catCode.length) {
                let subTitle = siteContent.subPages[key].title || '제목 없음';
                let subImg = siteContent.subPages[key].topImage || '';
                pageOptions += `<option value="page/${key}.html" data-title="${subTitle}" data-img="${subImg}">　└ ${subTitle}</option>`;
            }
        });
        pageOptions += `</optgroup>`;
    });

    siteContent.quickLinks.forEach((link, index) => {
        // Highlight standard first 3 cards for clarity
        const isMainCard = index < 3;

        if (!link.images || link.images.length === 0) { link.images = link.src ? [link.src] : ['']; }

        let imagesHtml = '';
        link.images.forEach((imgSrc, imgIndex) => {
            imagesHtml += `
                <div class="q-image-row" style="display: flex; gap: 5px; align-items: center; margin-bottom: 5px; background: #fff; padding: 5px; border: 1px solid #eee; border-radius: 4px;">
                    <img src="${imgSrc || ''}" class="board-img-preview" onerror="this.src='img/no_image.png'" style="width:40px; height:40px; object-fit:cover; border-radius:4px; flex-shrink:0;">
                    <div class="file-input-wrapper" style="flex:1; display:flex; gap:5px;">
                        <input type="text" placeholder="이미지 경로" value="${imgSrc}" class="q-src" style="flex:1; font-size:11px;">
                        <button class="btn-file" onclick="simulateBoardFileSelect(this)" style="padding:2px 6px; font-size:11px;">찾기</button>
                        ${imgSrc ? `<a href="${imgSrc}" download target="_blank" class="btn-file" style="text-decoration:none; color:#333; display:inline-block; padding:2px 6px; font-size:11px;">다운</a>` : ''}
                        <button class="btn-remove" onclick="removeQuickLinkImage(${index}, ${imgIndex})" style="padding:2px 6px; font-size:11px;">X</button>
                    </div>
                </div>
            `;
        });

        const itemHtml = `
            <div class="qlink-item" draggable="true" ondragstart="handleDragStart(event, ${index})" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${index})" data-index="${index}" style="display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 10px; border: 1px solid ${isMainCard ? '#007bff' : '#eee'}; margin-bottom: 15px; background: ${isMainCard ? '#f0f8ff' : '#fafafa'}; box-shadow: ${isMainCard ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'}; cursor: move;">
                <div style="grid-column: 1 / -1; display:flex; justify-content:flex-end;">
                    <span style="font-size:12px; color:#999; margin-right:auto;">☰ Drag to Reorder</span>
                </div>

                <div style="grid-column: 1 / -1;">
                    <label style="font-size:11px; font-weight:bold; color:#555;">이미지 리스트 (슬라이드 순서대로)</label>
                    <div class="q-images-list">${imagesHtml}</div>
                    <button class="btn-sm" onclick="addQuickLinkImage(${index})" style="width:100%; margin-top:5px; background:#eee; border:1px dashed #999; color:#555;">+ 이미지 추가</button>
                </div>

                <div style="grid-column: 1;">
                    <label style="font-size:11px; color:#666; display:block; margin-bottom:2px;">카드 이름</label>
                    <input type="text" placeholder="카드 이름 입력" value="${link.title || link.alt || ''}" class="q-title" style="font-weight:bold; width:100%;">
                </div>
                <div style="grid-column: 2; display:flex; align-items:flex-end; gap:5px;">
                    <button class="btn-sm" style="padding:5px 8px; cursor:pointer;" onclick="moveQuickLink(${index}, -1)">▲</button>
                    <button class="btn-sm" style="padding:5px 8px; cursor:pointer;" onclick="moveQuickLink(${index}, 1)">▼</button>
                    <button class="btn-remove" onclick="removeQuickLink(${index})">삭제</button>
                </div>

                <div style="grid-column: 1 / -1;">
                    <label style="font-size:11px; color:#666; display:block; margin-bottom:2px;">설명</label>
                    <input type="text" placeholder="설명 입력" value="${link.desc || ''}" class="q-desc" style="width:100%;">
                </div>

                <!-- Page Connector -->
                <div style="grid-column: 1 / -1; margin-top:5px; background:#fff; padding:8px; border-radius:4px; border:1px solid #d0e3ff;">
                    <div style="display:flex; gap:5px; align-items:center;">
                        <span style="font-size:11px; font-weight:bold; color:#0056b3;">🔗 페이지 연결:</span>
                        <select class="q-page-select" style="flex:1; font-size:11px;" onchange="applyPageLink(this)">
                            <option value="${link.link || ''}" selected>${link.link || '선택 안함'}</option>
                            ${pageOptions}
                        </select>
                        <input type="hidden" class="q-link" value="${link.link || ''}">
                    </div>
                    
                    <div class="page-edit-area" style="display:none; margin-top:10px; padding-top:10px; border-top:1px dashed #bcd; background:#f0f8ff;">
                         <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <strong style="font-size:11px; color:#0056b3;">📄 연결된 페이지 정보 수정</strong>
                            <button onclick="syncPageInfo(this, 'pull')" style="font-size:10px; padding:2px 5px; background:#fff; border:1px solid #999; cursor:pointer;" title="페이지 정보를 카드로 가져오기">⬇ 가져오기 (Pull)</button>
                         </div>
                         <div style="display:grid; grid-template-columns: 60px 1fr; gap:5px; align-items:center; margin-bottom:5px;">
                            <span style="font-size:11px;">제목:</span>
                            <input type="text" class="p-title-edit" style="font-size:11px; padding:3px;">
                         </div>
                         <div style="display:grid; grid-template-columns: 60px 1fr auto; gap:5px; align-items:center;">
                            <span style="font-size:11px;">이미지:</span>
                            <input type="text" class="p-img-edit" style="font-size:11px; padding:3px;">
                            <button onclick="simulatePageFileSelect(this)" style="font-size:10px; padding:2px 5px;">파일</button>
                         </div>
                         <button onclick="syncPageInfo(this, 'push')" style="width:100%; margin-top:5px; background:#0056b3; color:white; border:none; padding:5px; font-size:11px; cursor:pointer;">⬆ 수정사항 페이지에 반영 (Push)</button>
                    </div>
                </div>
            </div>
        `;
        container.append(itemHtml);
    });

    // Restore & Init
    $('.qlink-item').each(function () {
        let linkVal = $(this).find('.q-link').val();
        if (linkVal) {
            let $select = $(this).find('.q-page-select');
            $select.val(linkVal);
            updatePageEditArea($select);
        }
    });
}

function updatePageEditArea(select) {
    var $item = $(select).closest('.qlink-item');
    var $editArea = $item.find('.page-edit-area');
    var val = $(select).val();

    if (val) {
        var $option = $(select).find('option:selected');
        $editArea.show();
        $editArea.find('.p-title-edit').val($option.data('title'));
        $editArea.find('.p-img-edit').val($option.data('img'));
    } else {
        $editArea.hide();
    }
}

function applyPageLink(select) {
    var val = $(select).val();
    $(select).closest('.qlink-item').find('.q-link').val(val || '');
    updatePageEditArea(select);
}

function syncPageInfo(btn, direction) {
    var $item = $(btn).closest('.qlink-item');
    var $select = $item.find('.q-page-select');
    var val = $select.val(); // page/subXX.html

    if (!val) {
        alert('연결할 페이지를 먼저 선택해주세요.');
        return;
    }

    var pageId = val.replace('page/', '').replace('.html', '');

    if (!siteContent.subPages[pageId]) {
        alert('유효한 내부 페이지가 아닙니다 (외부 링크일 수 있음).');
        return;
    }

    if (direction === 'pull') {
        var pageData = siteContent.subPages[pageId];
        if (confirm('정말로 페이지의 정보(제목, 이미지)를 이 카드로 가져오시겠습니까?')) {
            $item.find('.q-title').val(pageData.title);
            $item.find('.q-src').val(pageData.topImage);
            $item.find('.board-img-preview').attr('src', pageData.topImage || '../img/no_image.png');
        }
    } else if (direction === 'push') {
        var newTitle = $item.find('.p-title-edit').val();
        var newImg = $item.find('.p-img-edit').val();

        if (confirm('입력한 정보로 "' + pageId + '" 페이지의 제목과 이미지를 수정하시겠습니까?')) {
            siteContent.subPages[pageId].title = newTitle;
            siteContent.subPages[pageId].topImage = newImg;

            var $option = $select.find('option:selected');
            $option.data('title', newTitle);
            $option.data('img', newImg);

            alert('페이지 정보가 갱신되었습니다. (전체 저장 시 반영됩니다)');
        }
    }
}
// -- PART 3 --
function initSysNoticePopulation() {
    // --- Auto-populate sys_notice for Index Page if empty ---
    setTimeout(function () {
        if (typeof BoardManager !== 'undefined') {
            BoardManager.getPosts('sys_notice').then(function (posts) {
                if (!posts || posts.length === 0) {
                    console.log("Auto-populating sys_notice with sample data...");
                    var samples = [
                        { boardCode: 'sys_notice', subject: '[공지] 2026년도 신입생 모집 안내', content: '2026년도 신입생 모집이 시작되었습니다. 많은 관심 바랍니다.', authorName: '관리자', date: '2026-01-10' },
                        { boardCode: 'sys_notice', subject: '[휴무] 설 연휴 휴무 안내', content: '설 연휴 기간 동안 휴무입니다.', authorName: '관리자', date: '2026-01-08' },
                        { boardCode: 'sys_notice', subject: '[소식] 제과제빵 기능사 전원 합격!', content: '지난 회차 실기시험에서 수강생 전원이 합격했습니다.', authorName: '관리자', date: '2026-01-05' },
                        { boardCode: 'sys_notice', subject: '[이벤트] 원데이 베이킹 클래스 오픈', content: '주말 원데이 클래스가 오픈되었습니다. 선착순 마감!', authorName: '홍보팀', date: '2026-01-02' }
                    ];

                    samples.forEach(function (s) {
                        BoardManager.addPost(s);
                    });
                }
            });
        }
    }, 1000);
}
// -- Part 3 Content --
function renderSideBannersList() {
    const container = $('#side-banners-list');
    container.empty();
    if (!siteContent.sideBanners) siteContent.sideBanners = [];

    siteContent.sideBanners.forEach((banner, index) => {
        const itemHtml = `
            <div class="side-banner-item" data-index="${index}" style="display: grid; grid-template-columns: 100px 1fr 150px auto; gap: 10px; margin-bottom: 20px; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 8px; align-items: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);">
                 <img src="${banner.src || ''}" class="board-img-preview" onerror="this.src='img/no_image.png'" style="width: 100px; height: 60px; object-fit: cover; background: #eee; border-radius: 4px;">
                 <div class="file-input-wrapper" style="display: flex; gap: 5px; align-items: center;">
                    <input type="text" placeholder="이미지 경로" value="${banner.src || ''}" class="side-src" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                    <button class="btn-file" onclick="simulateSideBannerFileSelect(this)" style="white-space: nowrap; padding: 4px 8px; font-size: 12px; cursor: pointer; background: #eee; border: 1px solid #ccc; border-radius: 4px;">파일 선택</button>
                 </div>
                 <input type="text" placeholder="링크 (예: page/sub0501.html)" value="${banner.link || ''}" class="side-link" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                 <button class="btn-remove" onclick="removeSideBanner(${index})" style="background-color: var(--admin-danger); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">삭제</button>
                 <div style="grid-column: 1 / -1; display:flex; gap:10px; align-items:center;">
                    <label><input type="checkbox" class="side-visible" ${banner.visible !== false ? 'checked' : ''}> 보이기</label>
                    <input type="text" placeholder="설명 (alt)" value="${banner.alt || ''}" class="side-alt" style="flex:1;">
                    <input type="number" placeholder="순서 (1~)" value="${banner.order || (index + 1)}" class="side-order" style="width:60px;">
                    <input type="text" placeholder="위치 (top px)" value="${banner.top || (150 + index * 120) + 'px'}" class="side-top" style="width:80px;">
                 </div>
            </div>
        `;
        container.append(itemHtml);
    });
}

function addSideBanner() {
    if (!siteContent.sideBanners) siteContent.sideBanners = [];
    siteContent.sideBanners.push({
        src: "img/banner_sample.jpg",
        link: "",
        alt: "사이드 배너",
        visible: true,
        order: siteContent.sideBanners.length + 1,
        top: (150 + siteContent.sideBanners.length * 120) + "px"
    });
    renderSideBannersList();
}

function removeSideBanner(index) {
    if (confirm('삭제하시겠습니까?')) {
        siteContent.sideBanners.splice(index, 1);
        renderSideBannersList();
    }
}

function simulateSideBannerFileSelect(btn) {
    $('#hidden-file-input').off('change').on('change', function () {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            const simulatedPath = `img_up/shop_pds/sejongcook/farm/${fileName}`;
            const $item = $(btn).closest('.side-banner-item');
            $item.find('.side-src').val(simulatedPath);
            $item.find('.board-img-preview').attr('src', simulatedPath);
        }
        this.value = '';
    });
    $('#hidden-file-input').click();
}

function renderFloatMenuList() {
    const container = $('#float-menu-list');
    container.empty();
    if (!siteContent.floatMenu) siteContent.floatMenu = [];

    siteContent.floatMenu.forEach((menu, index) => {
        const itemHtml = `
            <div class="float-menu-item" data-index="${index}" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center; background: #fff; padding: 10px; border: 1px solid #eee;">
                <input type="text" placeholder="메뉴명" value="${menu.text || ''}" class="float-text" style="width: 120px;">
                <input type="text" placeholder="링크 (#id, tel:, url)" value="${menu.link || ''}" class="float-link" style="flex: 1;">
                <input type="text" placeholder="아이콘 (이모지/이미지)" value="${menu.icon || ''}" class="float-icon" style="width: 80px;">
                <button class="btn-remove" onclick="removeFloatMenu(${index})">삭제</button>
            </div>
        `;
        container.append(itemHtml);
    });
}

function addFloatMenu() {
    if (!siteContent.floatMenu) siteContent.floatMenu = [];
    siteContent.floatMenu.push({ text: "새 메뉴", link: "#", icon: "🔗" });
    renderFloatMenuList();
}

function removeFloatMenu(index) {
    siteContent.floatMenu.splice(index, 1);
    renderFloatMenuList();
}

// --- Render Sitemap Grid (New UI) ---
function renderSitemapGrid() {
    var $container = $('#subpage-grid-container');
    $container.empty();

    var categories = {
        'sub01': '학원소개',
        'sub02': '제과제빵과정',
        'sub03': '조리교육과정',
        'sub04': '자격증&진학',
        'sub05': '취업정보',
        'sub06': '커뮤니티'
    };

    Object.keys(categories).forEach(catCode => {
        let catTitle = (siteContent.subPages[catCode] && siteContent.subPages[catCode].title) ? siteContent.subPages[catCode].title : categories[catCode];

        // Group Container
        let $group = $(`<div class="sitemap-group">
            <h4 data-cat="${catCode}">
                ${catTitle} 
                <button onclick="deleteCategory('${catCode}')" style="font-size:11px; background:#eee; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; color:#666;">❌</button>
            </h4>
        </div>`);

        // Filter pages for this category
        let categoryPages = Object.keys(siteContent.subPages).filter(key => key.startsWith(catCode) && key.length > catCode.length).sort();

        // 1. Add Main Page Card (if exists/virtual) - optional, but usually subXX is the "Main"
        // In this structure, sub01 itself is a page.
        if (siteContent.subPages[catCode]) {
            $group.append(createSitemapCard(catCode, siteContent.subPages[catCode], true));
        }

        // 2. Add Sub Pages
        categoryPages.forEach(pageId => {
            $group.append(createSitemapCard(pageId, siteContent.subPages[pageId], false));
        });

        // 3. Add 'Add SubPage' Button for this category
        $group.append(`
            <div style="margin-top:10px; border-top:1px dashed #eee; padding-top:10px; text-align:center;">
                <button onclick="addNewSubPage('${catCode}')" style="width:100%; border:1px dashed #aaa; background:#fff; padding:8px 0; border-radius:4px; color:#666; cursor:pointer; font-size:12px; transition:all 0.2s;">
                   + 하위 메뉴 추가 (Add Page)
                </button>
            </div>
        `);

        $container.append($group);
    });
}

function createSitemapCard(id, pageData, isMain) {
    let title = pageData.title || '제목 없음';
    let link = pageData.isBoard ? '게시판 (Board)' : `page/${id}.html`;

    // Added onclick to main card, and stopPropagation to inner interactive elements
    return `
    <div class="sitemap-card" id="card-${id}" onclick="goToPageEdit('${id}')" style="cursor:pointer;">
        <div class="sitemap-card-header">
            <input type="text" class="sitemap-card-input p-title-edit" value="${title}" 
                   onchange="updatePageTitle('${id}', this.value)" onclick="event.stopPropagation()" placeholder="페이지 제목">
            ${!isMain ? `<button class="btn-card-del" onclick="event.stopPropagation(); deleteSubPage('${id}')">✕</button>` : ''}
        </div>
        <div class="sitemap-card-id">
            ${isMain ? '<span style="color:#007bff; font-weight:bold;">[메인]</span>' : ''} 
            ID: ${id} <br>
            <span style="color:#aaa;">${link}</span>
        </div>
        <div class="sitemap-card-actions">
            <button class="btn-content-setting" onclick="goToPageEdit('${id}')">내용/게시판 설정</button>
        </div>
    </div>`;
}

// Global make accessible
window.addNewSubPage = addNewSubPage;
function addNewSubPage(catCode) {
    if (!catCode) {
        // Fallback for global button if exists
        catCode = prompt("추가할 카테고리 코드를 입력하세요 (예: sub07)");
        if (!catCode) return;
    }

    // Generate New ID
    // Find all IDs starting with catCode and longer than catCode (sub-pages)
    let existingIds = Object.keys(siteContent.subPages)
        .filter(k => k.startsWith(catCode) && k.length > catCode.length)
        .sort();

    let nextNum = 1;
    if (existingIds.length > 0) {
        // Get last one's number suffix
        let lastId = existingIds[existingIds.length - 1];
        let suffix = lastId.replace(catCode, '');
        if (!isNaN(suffix)) {
            nextNum = parseInt(suffix) + 1;
        }
    }

    // Pad with leading zero if needed (Assuming 2 digits standard like sub0201)
    let nextId = catCode + (nextNum < 10 ? '0' + nextNum : nextNum);

    // Check collision (paranoid check)
    while (siteContent.subPages[nextId]) {
        nextNum++;
        nextId = catCode + (nextNum < 10 ? '0' + nextNum : nextNum);
    }

    // Create Page
    siteContent.subPages[nextId] = {
        title: "새 메뉴 " + nextNum,
        htmlContent: "",
        items: [],
        slides: [],
        boardConfig: { enable: false, title: "게시판", count: 5 }
    };

    saveToLocal(true);
    renderSitemapGrid();

    // Optional: Open Editor immediately?
    // goToPageEdit(nextId);
}

function updatePageTitle(id, newTitle) {
    if (siteContent.subPages[id]) {
        siteContent.subPages[id].title = newTitle;
    }
}

function deleteSubPage(id) {
    if (confirm('[' + id + '] 페이지를 정말 삭제하시겠습니까?')) {
        delete siteContent.subPages[id];
        renderSitemapGrid();
    }
}


function generateConfig() {
    // 1. Collect Intro
    siteContent.introText = {
        title: $('#intro-title-val').val(),
        lines: [$('#intro-line1-val').val(), $('#intro-line2-val').val()]
    };

    // Header Config
    if (!siteContent.headerConfig) siteContent.headerConfig = {};
    siteContent.headerConfig.showAuthLinks = $('#show-auth-links-toggle').is(':checked');

    // 2. Collect Main Hero
    siteContent.mainHero = {
        title: $('#main-hero-title-val').val(),
        subtitle: $('#main-hero-desc-val').val(),
        badgeText: $('#main-hero-badge-val').val(),
        description: $('#main-hero-long-desc-val').val(),
        bgImage: $('#hero-img-1').val(), // Default to 1st image as BG fallback
        images: [
            $('#hero-img-1').val(), $('#hero-img-2').val(), $('#hero-img-3').val(),
            $('#hero-img-4').val(), $('#hero-img-5').val(), $('#hero-img-6').val()
        ].filter(url => url && url.trim() !== "")
    };

    // 3. Hero Buttons
    siteContent.heroButtons = {
        primary: { text: $('#hero-btn1-text').val(), link: $('#hero-btn1-link').val() },
        secondary: { text: $('#hero-btn2-text').val(), link: $('#hero-btn2-link').val() }
    };

    // 4. Hero Phone
    siteContent.heroPhone = {
        visible: $('#hero-phone-visible').is(':checked'),
        number: $('#hero-phone-number').val(),
        fontSize: $('#hero-phone-size').val(),
        icon: $('#hero-phone-icon').val(),
        borderColor: $('#hero-phone-border-color').val()
    };

    // 5. Section Headers
    siteContent.sectionHeaders = {
        middle: { title: $('#sec-mid-title').val(), subtitle: $('#sec-mid-desc').val() },
        bottom: { title: $('#sec-bot-title').val(), subtitle: $('#sec-bot-desc').val() }
    };

    // 6. Logo Settings
    siteContent.logo = {
        visible: $('#logo-visible-val').is(':checked'),
        type: $('input[name="logo-type"]:checked').val(),
        src: $('#logo-src-val').val(),
        alt: $('#logo-alt-val').val(),
        width: $('#logo-width-val').val() + 'px',
        textLines: $('input[name="logo-lines"]:checked').val(),
        text: $('#logo-text-val').val(),
        textLine1: $('#logo-text-line1-val').val(),
        textLine2: $('#logo-text-line2-val').val(),
        textColor: $('#logo-text-color').val(),
        textSize: $('#logo-text-size-val').val(),
        textFont: $('#logo-text-font-val').val(),
        textWeight: $('#logo-text-weight-val').val(),
        prefixUse: $('#logo-prefix-use').is(':checked'),
        prefixText: $('#logo-prefix-text-val').val(),
        prefixColor: $('#logo-prefix-color').val(),
        prefixSize: $('#logo-prefix-size-val').val(),
        posMode: $('input[name="logo-pos-mode"]:checked').val(),
        top: $('#logo-top-val').val(),
        left: $('#logo-left-val').val(),
        zIndex: $('#logo-zindex-val').val(),
        align: $('#logo-align-val').val()
    };

    // 7. Footer Info
    siteContent.footerInfo = {
        address: $('#footer-address').val(),
        tel: $('#footer-tel').val(),
        fax: $('#footer-fax').val(),
        ceo: $('#footer-ceo').val(),
        bizNum: $('#footer-biznum').val(),
        copyright: $('#footer-copyright').val()
    };

    // 8. Card Grid Style
    siteContent.cardGridStyle = {
        columns: parseInt($('#card-grid-columns').val()) || 3,
        textAlign: $('#card-grid-align').val(),
        cardHeight: $('#card-grid-height').val() + 'px',
        titleColor: $('#card-grid-title-color').val(),
        descColor: $('#card-grid-desc-color').val(),
        cardBg: $('#card-grid-bg-color').val(),
        titleSize: $('#card-grid-title-size').val(),
        descSize: $('#card-grid-desc-size').val()
    };

    // 9. Collect Lists (Slides, QuickLinks, SideBanners, FloatMenu)
    siteContent.heroSlides = [];
    $('.slide-item').not('#subpage-slides-list .slide-item').each(function () {
        siteContent.heroSlides.push({
            src: $(this).find('.s-src').val(),
            alt: $(this).find('.s-alt').val(),
            buttonText: $(this).find('.s-btn-text').val(),
            link: $(this).find('.s-link').val()
        });
    });

    siteContent.quickLinks = [];
    $('.qlink-item').each(function () {
        var images = [];
        $(this).find('.q-src').each(function () { if ($(this).val()) images.push($(this).val()); });

        siteContent.quickLinks.push({
            src: images[0] || '', // Back-compat
            images: images,
            title: $(this).find('.q-title').val(),
            desc: $(this).find('.q-desc').val(),
            link: $(this).find('.q-link').val()
        });
    });

    siteContent.sideBanners = [];
    $('.side-banner-item').each(function () {
        siteContent.sideBanners.push({
            src: $(this).find('.side-src').val(),
            link: $(this).find('.side-link').val(),
            alt: $(this).find('.side-alt').val(),
            visible: $(this).find('.side-visible').is(':checked'),
            order: parseInt($(this).find('.side-order').val()) || 99,
            top: $(this).find('.side-top').val()
        });
    });

    siteContent.floatMenu = [];
    $('.float-menu-item').each(function () {
        siteContent.floatMenu.push({
            text: $(this).find('.float-text').val(),
            link: $(this).find('.float-link').val(),
            icon: $(this).find('.float-icon').val()
        });
    });

    // 10. SubPages Current Edit Save
    var pageId = $('#subpage-selector').val();
    if (pageId && siteContent.subPages[pageId]) {
        // Re-gather items from DOM to ensure latest edits are saved
        // (Only if the editor is actually open/visible for this page, roughly checked by pageId match)
        var capturedItems = [];
        $('#subpage-items-list .sub-item').each(function () {
            var $el = $(this);
            var newItem = {};

            // Check for Table (HTML)
            var htmlVal = $el.find('.sub-i-html').val();
            if (htmlVal !== undefined) {
                // Table Type
                newItem.title = $el.find('.sub-i-title').val() || "";
                newItem.htmlContent = htmlVal;
            } else {
                // Common Fields
                var titleVal = $el.find('.sub-i-title').val();
                if (titleVal !== undefined) newItem.title = titleVal;

                var descVal = $el.find('.sub-i-desc').val();
                if (descVal !== undefined) newItem.desc = descVal;

                // Image Field
                var imgVal = $el.find('.sub-i-img').val();
                if (imgVal !== undefined) newItem.img = imgVal;

                // Link Fields
                var linkVal = $el.find('.sub-i-link').val();
                if (linkVal !== undefined) newItem.link = linkVal;

                var linkTextVal = $el.find('.sub-i-link-text').val();
                if (linkTextVal !== undefined) newItem.linkText = linkTextVal;
            }
            capturedItems.push(newItem);
        });

        // Only update if we actually found items or if the container was empty but valid
        // We trust the DOM state here as the 'edit' source of truth.
        siteContent.subPages[pageId].items = capturedItems;
    }
}

function saveToLocal(silent) {
    generateConfig();
    localStorage.setItem('sejongcook_admin_config_v2', JSON.stringify(siteContent));

    // Also save to server if available (Auto-Save to Disk)
    fetch('/api/save_full_backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteContent)
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log("Server save successful");
                if (!silent) {
                    const lastSaved = new Date().toLocaleTimeString();
                    const timeDisplay = document.getElementById('last-saved-time');
                    if (timeDisplay) timeDisplay.innerText = lastSaved;
                    alert('설정이 저장되고 서버에 적용되었습니다.\n(content_data.js Updated)');
                }
            } else {
                console.warn("Server save failed:", data.error);
                if (!silent) alert('브라우저에는 저장되었으나 서버 파일 저장에 실패했습니다.\n(' + data.error + ')');
            }
        })
        .catch(e => {
            console.warn("Server save error:", e);
            if (!silent) {
                const lastSaved = new Date().toLocaleTimeString();
                const timeDisplay = document.getElementById('last-saved-time');
                if (timeDisplay) timeDisplay.innerText = lastSaved;
                alert('설정이 브라우저에 임시 저장되었습니다.\n(서버 연결 불가: 수동 백업을 권장합니다)');
            }
        });
}

function previewChanges() {
    generateConfig();
    localStorage.setItem('sejongcook_admin_config_v2', JSON.stringify(siteContent));
    window.open('index.html', '_blank');
}

function downloadBackup() {
    generateConfig();

    // Format as valid JS file matching content_data.js structure
    const jsContent = "var siteContent = " + JSON.stringify(siteContent, null, 2) + ";";
    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(jsContent);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    // Change filename to match local file for direct overwrite
    downloadAnchorNode.setAttribute("download", "content_data.js");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function restoreBackup(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            let rawContent = e.target.result.trim();
            let jsonStr = rawContent;

            // Support both raw JSON and the new JS format
            if (rawContent.startsWith('var siteContent')) {
                // Strip 'var siteContent =' and trailing ';'
                // Regex to remove variable declaration equivalent to: var siteContent = ... ;
                jsonStr = rawContent.replace(/^var\s+siteContent\s*=\s*/, '').replace(/;$/, '');
            }

            const json = JSON.parse(jsonStr);
            if (json && typeof json === 'object') {
                if (confirm('백업 파일로 복원하시겠습니까? 현재 변경사항이 덮어씌워집니다.')) {
                    siteContent = json;
                    saveToLocal(true); // Save silently
                    alert('복원이 완료되었습니다. 페이지를 새로고침합니다.');
                    location.reload();
                }
            } else {
                alert('잘못된 백업 파일입니다.');
            }
        } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다: ' + error + '\n(올바른 JSON 또는 content_data.js 형식이 아닙니다.)');
        }
    };
    reader.readAsText(file);
}

function resetToDefaults() {
    if (confirm('정말로 모든 설정을 초기화하시겠습니까?\n(저장되지 않은 변경사항은 사라지며, 서버의 원래 설정으로 돌아갑니다.)')) {
        localStorage.removeItem('sejongcook_admin_config_v2');
        location.reload();
    }
}
// Alias for admin.html button
function resetToOriginal() {
    resetToDefaults();
}

function simulatePageFileSelect(btn) {
    $('#hidden-file-input').off('change').on('change', function () {
        if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            const simulatedPath = `img_up/shop_pds/sejongcook/farm/${fileName}`;
            $(btn).siblings('input.p-img-edit').val(simulatedPath);
        }
        this.value = '';
    });
    $('#hidden-file-input').click();
}

// -- View Switcher Logic --
function switchAdminView(viewType) {
    if (viewType === 'grid') {
        $('#view-grid').show();
        $('#view-list').hide();

        // Update Buttons
        $('#btn-view-grid').css({ 'background': '#fff', 'color': '#333', 'box-shadow': '0 1px 3px rgba(0,0,0,0.1)' });
        $('#btn-view-list').css({ 'background': 'transparent', 'color': '#666', 'box-shadow': 'none' });

        renderSitemapGrid(); // Refresh Grid
    } else {
        $('#view-grid').hide();
        $('#view-list').show();

        // Update Buttons
        $('#btn-view-list').css({ 'background': '#fff', 'color': '#333', 'box-shadow': '0 1px 3px rgba(0,0,0,0.1)' });
        $('#btn-view-grid').css({ 'background': 'transparent', 'color': '#666', 'box-shadow': 'none' });

        renderUnifiedManager(); // Refresh List
    }
}
window.switchAdminView = switchAdminView;

// -- Initialization --
$(function () {
    // Other inits might be here or in admin.html
    // Ensure logo settings are loaded
    if (typeof loadLogoSettings === 'function') {
        loadLogoSettings();
    }
});

// -- Backup & Restore Logic --
function downloadBackup() {
    if (!siteContent) {
        alert('데이터가 없습니다.');
        return;
    }

    // Add Metadata
    const backupData = JSON.parse(JSON.stringify(siteContent)); // Deep copy
    backupData._backupMeta = {
        date: new Date().toISOString(),
        version: "2.5"
    };

    // Format as Valid JS File
    const jsContent = "var siteContent = " + JSON.stringify(backupData, null, 2) + ";";

    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(jsContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    // Changed filename to content_data.js as requested for direct overwrite
    downloadAnchorNode.setAttribute("download", "content_data.js");

    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function restoreBackup(input) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            let fileContent = e.target.result;
            let json;

            // Detect format: JS or JSON
            if (fileContent.trim().startsWith('var siteContent')) {
                // It's a JS file. We need to extract the JSON object.
                // Remove 'var siteContent = ' and trailing ';'
                const firstBrace = fileContent.indexOf('{');
                const lastBrace = fileContent.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    const jsonStr = fileContent.substring(firstBrace, lastBrace + 1);
                    json = JSON.parse(jsonStr);
                } else {
                    throw new Error("JS 파일 내에서 유효한 JSON 객체를 찾을 수 없습니다.");
                }
            } else {
                // Assume standard JSON
                json = JSON.parse(fileContent);
            }

            // Basic Validation
            if (!json.logo && !json.subPages) {
                throw new Error("올바르지 않은 백업 파일 형식입니다.");
            }

            if (confirm('현재 설정을 백업 파일 내용으로 덮어쓰시겠습니까?')) {
                // Try Server Save First
                fetch('/api/save_full_backup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('복원 완료! 페이지를 새로고침합니다.');
                            location.reload();
                        } else {
                            throw new Error(data.error || 'Server Error');
                        }
                    })
                    .catch(err => {
                        console.warn("Server save failed, falling back to LocalStorage:", err);

                        // Fallback to LocalStorage
                        siteContent = json;
                        localStorage.setItem('sejongcook_admin_backup', JSON.stringify(json));
                        alert('서버 연결 실패. 브라우저 임시 저장소에만 복원되었습니다.');

                        loadLogoSettings();
                        renderUnifiedManager();
                        renderSitemapGrid();
                    });
            }
        } catch (err) {
            alert('복원 실패: ' + err.message);
        }

        // Reset input
        input.value = '';
    };

    reader.readAsText(file);
}

// Ensure global access
window.downloadBackup = downloadBackup;

// -- Instructor Management Logic --
function renderInstructorList() {
    const $container = $('#admin-instructor-list');
    $container.empty();

    if (!siteContent.instructors) siteContent.instructors = [];

    siteContent.instructors.forEach((inst, index) => {
        // Fix path for Admin Preview (strip ../ if exists, since Admin is at root)
        let displayImg = inst.img;
        if (displayImg.startsWith('../')) {
            displayImg = displayImg.substring(3); // Remove ../
        }

        const html = `
            <div class="instructor-card-admin" style="background:#fff; border:1px solid #ddd; border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <div style="position:relative; height:200px; background:#f5f5f5; border-bottom:1px solid #eee;">
                    <img src="${displayImg}" id="inst-prev-${index}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://placehold.co/300x400?text=No+Image'">
                    <div style="position:absolute; bottom:0; left:0; right:0; padding:10px; background:rgba(0,0,0,0.5);">
                         <div class="file-input-wrapper">
                            <input type="text" value="${inst.img}" onchange="updateInstructor(${index}, 'img', this.value)" style="flex:1; font-size:11px; padding:3px; background:rgba(255,255,255,0.9); border:none;" placeholder="이미지 URL">
                            <button onclick="simulateFileSelect('#hidden-file-input', function(src){ updateInstructor(${index}, 'img', src); })" style="padding:2px 5px; font-size:10px; cursor:pointer;">Upload</button>
                        </div>
                    </div>
                </div>
                <div style="padding:15px;">
                    <input type="text" value="${inst.name}" onchange="updateInstructor(${index}, 'name', this.value)" placeholder="이름 (Name)" style="width:100%; margin-bottom:5px; font-weight:bold; border:1px solid #eee; padding:5px;">
                    <input type="text" value="${inst.position}" onchange="updateInstructor(${index}, 'position', this.value)" placeholder="직책 (Position)" style="width:100%; margin-bottom:10px; font-size:12px; color:#666; border:1px solid #eee; padding:5px;">
                    <textarea onchange="updateInstructor(${index}, 'desc', this.value)" placeholder="소개글 (Introduction)" style="width:100%; height:60px; font-size:12px; border:1px solid #eee; resize:none; padding:5px;">${inst.desc}</textarea>
                    <button onclick="deleteInstructor(${index})" style="width:100%; margin-top:10px; background:#e74c3c; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">삭제 (Delete)</button>
                </div>
            </div>
        `;
        $container.append(html);
    });
}

function addInstructor() {
    if (!siteContent.instructors) siteContent.instructors = [];
    siteContent.instructors.push({
        name: "새 강사",
        position: "담당 과목",
        desc: "소개글을 입력하세요.",
        img: ""
    });
    renderInstructorList();
}

function updateInstructor(index, field, value) {
    if (siteContent.instructors && siteContent.instructors[index]) {
        siteContent.instructors[index][field] = value;
        if (field === 'img') {
            $(`#inst-prev-${index}`).attr('src', value);
        }
    }
}

function deleteInstructor(index) {
    if (confirm('이 강사 프로필을 삭제하시겠습니까?')) {
        siteContent.instructors.splice(index, 1);
        renderInstructorList();
    }
}

// Hook into initAdmin if possible, or auto-run
// -- Gallery Management Logic --
function renderGalleryList() {
    const $container = $('#admin-gallery-list');
    $container.empty();

    if (!siteContent.gallery) siteContent.gallery = [];

    siteContent.gallery.forEach((item, index) => {
        // Fix path for Admin Preview
        let displayImg = item.src;
        if (displayImg.startsWith('../')) {
            displayImg = displayImg.substring(3);
        }

        const html = `
            <div class="gallery-card-admin" style="background:#fff; border:1px solid #ddd; border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <div style="position:relative; height:180px; background:#f5f5f5; border-bottom:1px solid #eee;">
                    <img src="${displayImg}" id="gallery-prev-${index}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
                    <div style="position:absolute; bottom:0; left:0; right:0; padding:10px; background:rgba(0,0,0,0.5);">
                         <div class="file-input-wrapper">
                            <input type="text" value="${item.src}" onchange="updateGalleryItem(${index}, 'src', this.value)" style="flex:1; font-size:11px; padding:3px; background:rgba(255,255,255,0.9); border:none;" placeholder="이미지 URL">
                            <button onclick="simulateFileSelect('#hidden-file-input', function(src){ updateGalleryItem(${index}, 'src', src); })" style="padding:2px 5px; font-size:10px; cursor:pointer;">Upload</button>
                        </div>
                    </div>
                </div>
                <div style="padding:15px;">
                    <input type="text" value="${item.title}" onchange="updateGalleryItem(${index}, 'title', this.value)" placeholder="제목 (Title)" style="width:100%; margin-bottom:5px; font-weight:bold; border:1px solid #eee; padding:5px;">
                    <textarea onchange="updateGalleryItem(${index}, 'desc', this.value)" placeholder="설명 (Description)" style="width:100%; height:50px; font-size:12px; border:1px solid #eee; resize:none; padding:5px;">${item.desc}</textarea>
                    <button onclick="deleteGalleryItem(${index})" style="width:100%; margin-top:10px; background:#e74c3c; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">삭제 (Delete)</button>
                </div>
            </div>
        `;
        $container.append(html);
    });
}

function addGalleryItem() {
    if (!siteContent.gallery) siteContent.gallery = [];
    siteContent.gallery.push({
        src: "",
        title: "새 사진",
        desc: "설명을 입력하세요."
    });
    renderGalleryList();
}

function updateGalleryItem(index, field, value) {
    if (siteContent.gallery && siteContent.gallery[index]) {
        siteContent.gallery[index][field] = value;
        if (field === 'src') {
            // Preview update logic
            let displayImg = value;
            if (displayImg.startsWith('../')) {
                displayImg = displayImg.substring(3);
            }
            $(`#gallery-prev-${index}`).attr('src', displayImg);
        }
    }
}

function deleteGalleryItem(index) {
    if (confirm('이 사진을 갤러리에서 삭제하시겠습니까?')) {
        siteContent.gallery.splice(index, 1);
        renderGalleryList();
    }
}

// Update init hook
$(document).ready(function () {
    setTimeout(function () {
        if (typeof renderInstructorList === 'function') renderInstructorList();
        if (typeof renderGalleryList === 'function') renderGalleryList();
    }, 1000);
});
