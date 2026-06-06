const mockStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k,v) => mockStorage[k] = v
};
mockStorage['sejongSmsCalMonth'] = '6';

let m = mockStorage.getItem('sejongSmsCalMonth') ? parseInt(mockStorage.getItem('sejongSmsCalMonth')) : new Date().getMonth();
console.log(m);

mockStorage['sejongSmsCalMonth'] = '0';
let m2 = mockStorage.getItem('sejongSmsCalMonth') ? parseInt(mockStorage.getItem('sejongSmsCalMonth')) : new Date().getMonth();
console.log(m2);

mockStorage['sejongSmsCalMonth'] = '';
let m3 = mockStorage.getItem('sejongSmsCalMonth') ? parseInt(mockStorage.getItem('sejongSmsCalMonth')) : new Date().getMonth();
console.log(m3);
