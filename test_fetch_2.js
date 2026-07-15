async function test() {
    try {
        const examsRes = await fetch('http://localhost:3000/api/sejong/exams');
        const data = await examsRes.json();
        console.log("Length:", data.length);
        const july10 = data.filter(d => d.submitTime && d.submitTime.startsWith('2026-07-10'));
        console.log("July 10 items:", july10.length);
    } catch(e) {
        console.error(e);
    }
}
test();
