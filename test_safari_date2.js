const strDate = new Date("2026-06-05");
const localDate = new Date(2026, 5, 5);
console.log("strDate: ", strDate.getTime());
console.log("localDate: ", localDate.getTime());
console.log("strDate >= localDate", strDate.getTime() >= localDate.getTime());
