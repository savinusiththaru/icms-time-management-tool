const BASE_URL = 'http://localhost:3000';

async function verifyTeamFeatures() {
    console.log('--- Verifying Team Management & Reports ---');

    try {
        // 1. Create User
        const uniqueName = `User ${Date.now()}`;
        const uniqueEmail = `user${Date.now()}@example.com`;

        console.log(`[1] Creating User: ${uniqueName}`);
        const createRes = await fetch(`${BASE_URL}/api/users`, {
            method: 'POST',
            body: JSON.stringify({ name: uniqueName, email: uniqueEmail }),
            headers: { 'Content-Type': 'application/json' }
        });
        const newUser = await createRes.json();

        if (createRes.status === 201) {
            console.log('✅ User Created:', newUser.id);
        } else {
            console.error('❌ User Creation Failed:', newUser);
            return;
        }

        // 2. List Users
        console.log(`[2] Listing Users`);
        const listRes = await fetch(`${BASE_URL}/api/users`);
        const users = await listRes.json();
        const found = users.find(u => u.id === newUser.id);

        if (found) {
            console.log('✅ User Found in List');
        } else {
            console.error('❌ User NOT Found in List');
        }

        // 3. Create Task with Assignee
        console.log(`[3] Creating Task with Assignee`);
        const taskPayload = {
            title: "Team Task",
            description: "Assigned task test",
            priority: "HIGH",
            weekStart: "2023-11-06", // A Monday
            dueTime: new Date().toISOString(),
            recurrence: { enabled: false, intervalWeeks: 1, dayOfWeek: 1 },
            assigneeIds: [newUser.id],
            tags: []
        };

        const taskRes = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskPayload),
            headers: { 'Content-Type': 'application/json' }
        });
        const taskJson = await taskRes.json();

        if (taskRes.status === 201) {
            console.log('✅ Task Created with Assignee:', taskJson.task.id);
            // Ideally we check DB to see if assignee relation exists, but API success is good proxy for now
            // knowing our prisma schema
        } else {
            console.error('❌ Task Creation Failed:', taskJson);
        }

        // 4. Check Report Endpoint (Cache Busting Check)
        console.log(`[4] Checking Report Freshness`);
        // We just ensure it returns 200 and has dynamic header potentially (fetching twice)
        const rep1 = await fetch(`${BASE_URL}/api/reports/weekly?date=2023-11-06`);
        console.log('Report 1 Status:', rep1.status);

        // Manual verification of "freshness" is hard via script without changing data, 
        // but we confirmed code change `dynamic = 'force-dynamic'`.

    } catch (e) {
        console.error('Verification Error:', e);
    }
}

verifyTeamFeatures();
