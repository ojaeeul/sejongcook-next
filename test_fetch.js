async function test() {
    try {
        const [examsRes, membersRes, qRes] = await Promise.all([
            fetch('http://localhost:3000/api/sejong/exams'),
            fetch('http://localhost:3000/api/sejong/members'),
            fetch('http://localhost:3000/sejong/questions_data.json')
        ]);
        console.log("examsRes:", examsRes.status);
        console.log("membersRes:", membersRes.status);
        console.log("qRes:", qRes.status);
    } catch(e) {
        console.error(e);
    }
}
test();
