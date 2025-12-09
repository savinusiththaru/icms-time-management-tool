// verify.js
// verify.js
// using native fetch (Node 18+)
// Actually Node 18+ has global fetch. Let's try global fetch first.

const BASE_URL = 'http://localhost:3000';

async function test() {
    console.log('--- Starting Verification ---');

    // 1. Create a simple task
    console.log('\n[1] Creating simple task...');
    try {
        const res = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Verify Script Task",
                weekStart: "2023-12-11", // Ensure this is a Monday. 2023-12-11 was Mon.
                dueTime: new Date().toISOString(),
                priority: "HIGH",
                assigneeIds: [],
                tags: ["verification"]
            })
        });
        const json = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 201) console.log('Success:', json.data.id);
        else console.error('Failed:', json);
    } catch (e) { console.error('Error:', e.message); }

    // 2. Create recurring task
    console.log('\n[2] Creating recurring task...');
    try {
        const res = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Verify Recurring Task",
                weekStart: "2023-12-18", // Next Monday
                dueTime: new Date().toISOString(),
                priority: "MEDIUM",
                assigneeIds: [],
                recurrence: {
                    enabled: true,
                    intervalWeeks: 1,
                    dayOfWeek: 1
                }
            })
        });
        const json = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 201) {
            console.log('Success:', json.data.id);
            console.log('Recurring ID:', json.data.recurringTaskId);
        }
        else console.error('Failed:', json);
    } catch (e) { console.error('Error:', e.message); }

    // 3. Duplicate Conflict check
    console.log('\n[3] Testing Conflict (Duplicate)...');
    try {
        const resSuccess = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Unique Task",
                weekStart: "2023-12-11",
                dueTime: new Date().toISOString(),
                priority: "LOW",
                assigneeIds: []
            })
        });
        // Try again
        const resFail = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Unique Task",
                weekStart: "2023-12-11",
                dueTime: new Date().toISOString(),
                priority: "LOW",
                assigneeIds: []
            })
        });
        console.log(`First Call Status: ${resSuccess.status}`);
        console.log(`Second Call Status: ${resFail.status} (Expected 409)`);
    } catch (e) { console.error('Error:', e.message); }

}

test();
