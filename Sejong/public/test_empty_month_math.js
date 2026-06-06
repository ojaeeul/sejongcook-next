
function getFetchUrl(endpoint, isPost = false) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let url = '';
    if (isLocal) {
        if (endpoint === 'settings') {
            url = 'http://localhost:8000/api/admin/data/settings';
        } else {
            url = `http://localhost:8000/api/${endpoint}`;
        }
        return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    } else {
        const base = `../api.php?board=sejong_${endpoint}`;
        return isPost ? base : base + `&t=${Date.now()}`;
    }
}

let carryOverP = 0;
let manualMakeup = 0;
let attendances = 0;

let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
let vRaw = Math.round(totalCombined * 10);

let m_P;
if (vRaw <= 80) {
    // mc.m_J = 0;
    m_P = vRaw / 10;
} else {
    // mc.m_J = 8;
    let pRaw = vRaw - 80;
    m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
}

console.log("If 0 -> vRaw:", vRaw, "m_P:", m_P);

carryOverP = 0.5; // What if it is 0.5?
vRaw = Math.round(carryOverP * 10);
if (vRaw <= 80) {
    m_P = vRaw / 10;
} else {
    let pRaw = vRaw - 80;
    m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
}
console.log("If 0.5 -> vRaw:", vRaw, "m_P:", m_P);

