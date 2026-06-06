const getCycle = (val, isDual) => {
    let vRaw = Math.round(val * 10);
    if (isDual) {
        if (vRaw < 170) return 0;
        return Math.floor((vRaw - 170) / 160) + 1;
    } else {
        if (vRaw < 90) return 0;
        return Math.floor((vRaw - 90) / 80) + 1;
    }
};

const getCycleT = (val, isDual) => {
    let vRaw = Math.round(val * 10);
    if (isDual) {
        if (vRaw < 170) return 0;
        return Math.floor((vRaw - 170) / 160) + 1;
    } else {
        if (vRaw <= 80) return 0;
        let pRaw = vRaw - 80;
        if (pRaw <= 0) return 0;
        return Math.floor((pRaw - 10) / 80) + 1;
    }
};

for (let i = 0; i <= 300; i += 10) {
    const val = i / 10;
    const l1 = getCycle(val, true);
    const t1 = getCycleT(val, true);
    if (l1 !== t1) console.log(`Dual Mismatch at ${val}: ${l1} vs ${t1}`);
    const l2 = getCycle(val, false);
    const t2 = getCycleT(val, false);
    if (l2 !== t2) console.log(`Non-Dual Mismatch at ${val}: ${l2} vs ${t2}`);
}
