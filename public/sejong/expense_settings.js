const fontList = [
    { name: '나눔펜 스크립트 (기본)', value: 'Nanum Pen Script', size: '19px' },
    { name: '노토 산스 KR', value: 'Noto Sans KR', size: '14px' },
    { name: '고운 돋움', value: 'Gowun Dodum', size: '15px' },
    { name: '고운 바탕', value: 'Gowun Batang', size: '15px' },
    { name: '감자꽃', value: 'Gamja Flower', size: '18px' },
    { name: '하이 멜로디', value: 'Hi Melody', size: '17px' },
    { name: '주아', value: 'Jua', size: '15px' },
    { name: '도현', value: 'Do Hyeon', size: '14px' },
    { name: '흑백사진', value: 'Black And White Picture', size: '18px' },
    { name: '큐트 폰트', value: 'Cute Font', size: '18px' },
    { name: '독도', value: 'Dokdo', size: '19px' },
    { name: '동글', value: 'Dongle', size: '22px' },
    { name: '개구', value: 'Gaegu', size: '17px' },
    { name: '구기', value: 'Gugi', size: '15px' },
    { name: '푸어 스토리', value: 'Poor Story', size: '16px' },
    { name: '싱글 데이', value: 'Single Day', size: '16px' },
    { name: '송명', value: 'Song Myung', size: '16px' },
    { name: '스타일리시', value: 'Stylish', size: '16px' },
    { name: '해바라기', value: 'Sunflower', size: '15px' },
    { name: '연성', value: 'Yeon Sung', size: '18px' },
    { name: '함초롬', value: 'Hahmlet', size: '14px' },
    { name: '나눔 고딕', value: 'Nanum Gothic', size: '14px' },
    { name: '나눔 명조', value: 'Nanum Myeongjo', size: '14px' }
];


const FONT_SIZES = {
    'Nanum Pen Script': '19px',
    'Noto Sans KR': '13px',
    'Gowun Dodum': '14px',
    'Gowun Batang': '14px',
    'Gamja Flower': '18px',
    'Hi Melody': '17px',
    'Jua': '15px',
    'Do Hyeon': '14px',
    'Black And White Picture': '16px',
    'Cute Font': '18px',
    'Dokdo': '18px',
    'Dongle': '22px',
    'Gaegu': '16px',
    'Gugi': '15px',
    'Poor Story': '15px',
    'Single Day': '15px',
    'Song Myung': '15px',
    'Stylish': '16px',
    'Sunflower': '14px',
    'Yeon Sung': '16px',
    'Hahmlet': '14px',
    'Nanum Gothic': '13px',
    'Nanum Myeongjo': '14px'
};

const PRESET_COLORS = [
    { name: '기본(검정)', value: 'inherit' },
    { name: '다크 블루', value: '#1e3a8a' },
    { name: '다크 레드', value: '#7f1d1d' },
    { name: '다크 그린', value: '#14532d' },
    { name: '다크 퍼플', value: '#4c1d95' },
    { name: '브라운', value: '#78350f' }
];

let currentSettings = {
    fontFamily: 'Nanum Pen Script',
    isBold: true,
    color: 'inherit'
};

function initNotebookSettings() {
    loadSettings();
    renderFontOptions();
    renderColorPresets();
    applySettingsToDOM();
    
    // Bind modal toggle
    const gearBtn = document.getElementById('notebook-settings-btn');
    const modal = document.getElementById('notebook-settings-modal');
    const overlay = document.getElementById('notebook-settings-overlay');
    
    if (gearBtn) gearBtn.addEventListener('click', toggleSettingsModal);
    if (overlay) overlay.addEventListener('click', toggleSettingsModal);
    
    // Bind controls
    document.getElementById('setting-font-select').addEventListener('change', (e) => {
        currentSettings.fontFamily = e.target.value;
        loadGoogleFont(e.target.value);
        saveAndApplySettings();
    });
    
    document.getElementById('setting-bold-toggle').addEventListener('change', (e) => {
        currentSettings.isBold = e.target.checked;
        saveAndApplySettings();
    });
    
    document.getElementById('setting-color-picker').addEventListener('input', (e) => {
        currentSettings.color = e.target.value;
        saveAndApplySettings();
    });
}

function loadSettings() {
    const saved = localStorage.getItem('notebookTextSettings');
    if (saved) {
        try {
            currentSettings = { ...currentSettings, ...JSON.parse(saved) };
            if(currentSettings.fontFamily) loadGoogleFont(currentSettings.fontFamily);
        } catch(e) { console.error('Failed to parse settings'); }
    }
    
    // Update UI to match loaded state
    setTimeout(() => {
        const fontSelect = document.getElementById('setting-font-select');
        const boldToggle = document.getElementById('setting-bold-toggle');
        const colorPicker = document.getElementById('setting-color-picker');
        
        if (fontSelect) fontSelect.value = currentSettings.fontFamily;
        if (boldToggle) boldToggle.checked = currentSettings.isBold;
        if (colorPicker) {
            // Only set hex values to color picker
            if (currentSettings.color.startsWith('#')) {
                colorPicker.value = currentSettings.color;
            }
        }
    }, 0);
}

function saveAndApplySettings() {
    localStorage.setItem('notebookTextSettings', JSON.stringify(currentSettings));
    applySettingsToDOM();
}

function loadGoogleFont(fontFamily) {
    if (fontFamily === 'Nanum Pen Script' || fontFamily === 'Noto Sans KR') return; // Already loaded
    
    const fontId = 'font-' + fontFamily.replace(/\s+/g, '-').toLowerCase();
    if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
        document.head.appendChild(link);
    }
}

function applySettingsToDOM() {
    // We create or update a style tag to apply globally to all .entry-line elements
    let styleTag = document.getElementById('dynamic-notebook-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-notebook-style';
        document.head.appendChild(styleTag);
    }
    
    const weight = currentSettings.isBold ? 'bold' : 'normal';
    const colorStr = currentSettings.color === 'inherit' ? '' : `color: ${currentSettings.color} !important;`;
    const fontSize = FONT_SIZES[currentSettings.fontFamily] || '16px';
    
        const fontObj = fontList.find(f => f.value === currentSettings.fontFamily) || fontList[0];
    const fontSizeStr = fontObj.size;
    
    styleTag.innerHTML = `
        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: ${fontSizeStr} !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }
        .entry-line .method-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: calc(${fontSizeStr} * 0.5) !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }
        .page-title {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
        }
    `;
}

function renderFontOptions() {
    const select = document.getElementById('setting-font-select');
    if (!select) return;
    select.innerHTML = '';
    
    fontList.forEach(font => {
        const option = document.createElement('option');
        option.value = font.value;
        option.textContent = font.name;
        select.appendChild(option);
    });
}

function renderColorPresets() {
    const container = document.getElementById('color-presets-container');
    if (!container) return;
    container.innerHTML = '';
    
    PRESET_COLORS.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'color-preset-btn';
        btn.style.backgroundColor = preset.value === 'inherit' ? '#e2e8f0' : preset.value;
        btn.title = preset.name;
        
        btn.onclick = () => {
            currentSettings.color = preset.value;
            saveAndApplySettings();
            
            if (preset.value.startsWith('#')) {
                document.getElementById('setting-color-picker').value = preset.value;
            }
        };
        
        container.appendChild(btn);
    });
}

function toggleSettingsModal() {
    const modal = document.getElementById('notebook-settings-modal');
    const overlay = document.getElementById('notebook-settings-overlay');
    if (!modal) return;
    
    const isVisible = modal.style.display === 'block';
    modal.style.display = isVisible ? 'none' : 'block';
    if(overlay) overlay.style.display = isVisible ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    initNotebookSettings();
});
