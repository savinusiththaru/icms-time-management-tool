// verify-recurrence.js
// Uses native fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';

async function testRecurrence() {
    console.log('--- Starting Recurrence Verification ---');

    // 1. Create a recurring task (Week 1)
    console.log('\n[1] Creating Recurring Task (Master)...');
    const weekStart = "2023-10-02"; // A specific Monday in the past to force generation needs

    let masterId;

    try {
        const res = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Recurring Test " + Date.now(),
                weekStart: weekStart,
                dueTime: new Date().toISOString(),
                priority: "HIGH",
                assigneeIds: [],
                recurrence: {
                    enabled: true,
                    intervalWeeks: 1,
                    dayOfWeek: 1
                }
            })
        });
        const json = await res.json();
        if (res.status === 201) {
            console.log('Success Master ID:', json.data.recurringTaskId);
            masterId = json.data.recurringTaskId;
        } else {
            console.error('Failed to create master:', json);
            return;
        }
    } catch (e) { console.error('Error:', e.message); return; }

    // 2. Trigger Generator
    console.log('\n[2] Triggering Generator...');
    try {
        const res = await fetch(`${BASE_URL}/api/cron/generate`, {
            method: 'POST'
        });
        const json = await res.json();
        console.log('Generator Result:', json);

        if (json.created > 0) {
            console.log("✅ Successfully created future instances.");
        } else {
            console.log("⚠️ No instances created. Might be up to date or buffer logic issue.");
        }

    } catch (e) { console.error('Error:', e.message); }
}

testRecurrence();
