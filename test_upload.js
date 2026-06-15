async function run() {
    try {
        const bigBase64 = "data:image/jpeg;base64," + "A".repeat(1500000);
        const res = await fetch('http://localhost:3000/api/sejong/members', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: "test12345",
                name: "TestUserBig",
                phone: "010-1234-5678",
                photo: bigBase64,
                faceDescriptor: new Array(128).fill(0.123)
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
