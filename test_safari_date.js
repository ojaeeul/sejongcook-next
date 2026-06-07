const safariDate = new Date('2026-06-05T00:00:00');
console.log("safariDate:", safariDate.toISOString());
const localDate = new Date(2026, 5, 5);
console.log("localDate:", localDate.toISOString());
console.log("safariDate >= localDate:", safariDate >= localDate);
console.log("safariDate <= localDate:", safariDate <= localDate);
