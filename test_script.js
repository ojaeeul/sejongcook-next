const parseDate = (dStr) => {
    const match = dStr.match(/(\d+)\/(\d+)/);
    if (!match) return 9999;
    return parseInt(match[1]) * 100 + parseInt(match[2]);
};
console.log(parseDate("6/14(일)"));
console.log(parseDate("7/25(화)"));
console.log(parseDate("7/24(일)"));
console.log(parseDate("8/2(수)"));
console.log(parseDate(""));
