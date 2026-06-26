fetch('http://localhost:3000/api/sejong/ai_analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }],
        generationConfig: { temperature: 0.0, responseMimeType: "application/json" }
    })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(console.log)
.catch(console.error);
