let dates = [
    {date: "2026-02-05"},
    {date: "2025-12-07"},
    {date: "2026-01-15"}
];

dates.sort((a,b) => new Date(a.date) - new Date(b.date));
console.log(dates);

let earliestYear = 2026;
let earliestMonth = 2;
if (dates.length > 0) {
    const d = new Date(dates[0].date);
    earliestYear = d.getFullYear();
    earliestMonth = d.getMonth() + 1;
}
console.log(earliestYear, earliestMonth);
