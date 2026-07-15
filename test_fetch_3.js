async function test() {
    try {
        console.log("Fetching exams...");
        const examsRes = await fetch('http://localhost:3000/api/sejong/exams');
        const examsData = await examsRes.json();
        console.log("Exams parsed:", examsData.length);

        console.log("Fetching members...");
        const membersRes = await fetch('http://localhost:3000/api/sejong/members');
        const memArray = await membersRes.json();
        console.log("Members parsed:", memArray.length);

        console.log("Fetching questions...");
        const qRes = await fetch('http://localhost:3000/sejong/questions_data.json');
        const questionsData = await qRes.json();
        console.log("Questions parsed:", Object.keys(questionsData).length);
        
        console.log("All JSON parsing successful!");
    } catch(e) {
        console.error("ERROR IN PARSING:", e);
    }
}
test();
