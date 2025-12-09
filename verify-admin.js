// verify-admin.js
const BASE_URL = 'http://localhost:3000';

async function testAdminFeatures() {
    console.log('--- Starting Admin Features Verification ---');

    // 1. Create a task to delete
    console.log('\n[1] Creating Task for Deletion...');
    let taskIdToDelete;
    try {
        const res = await fetch(`${BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "To Be Deleted " + Date.now(),
                weekStart: "2023-10-02", // Known Monday to pass validation
                dueTime: new Date().toISOString(),
                priority: "LOW",
                assigneeIds: [],
                recurrence: {
                    enabled: false,
                    intervalWeeks: 1,
                    dayOfWeek: 1
                }
            })
        });
        const json = await res.json();
        if (res.status === 201) {
            taskIdToDelete = json.data.id;
            console.log('Created ID:', taskIdToDelete);
        } else {
            console.error('Failed creation:', json);
            // If it fails on validation (e.g. weekStart not Monday), we need a valid Monday.
            // But let's assume the previous scripts worked. using current date might fail.
            // Let's use a known valid Monday.
            return;
        }
    } catch (e) { console.error('Error:', e.message); return; }

    // 2. Update Status
    console.log('\n[2] Updating Status to COMPLETED...');
    try {
        const res = await fetch(`${BASE_URL}/api/tasks/${taskIdToDelete}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' })
        });
        const json = await res.json();
        if (json.data.status === 'COMPLETED') {
            console.log('✅ Status updated to COMPLETED');
        } else {
            console.error('❌ Status update failed', json);
        }
    } catch (e) { console.error('Error:', e.message); }

    // 3. Delete Task
    console.log('\n[3] Deleting Task...');
    try {
        const res = await fetch(`${BASE_URL}/api/tasks/${taskIdToDelete}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
            console.log('✅ Task deleted successfully');
        } else {
            console.error('❌ Delete failed', json);
        }
    } catch (e) { console.error('Error:', e.message); }

    // 4. Verify Deletion
    console.log('\n[4] Verifying Deletion (GET)...');
    // We don't have a GET /api/tasks/[id] yet, preventing direct check, 
    // but we can try DELETE again and expect 404
    const res = await fetch(`${BASE_URL}/api/tasks/${taskIdToDelete}`, { method: 'DELETE' });
    if (res.status === 404) {
        console.log('✅ Confirmed 404 on subsequent delete.');
    } else {
        console.log('⚠️ Unexpected status on 2nd delete:', res.status);
    }
}

testAdminFeatures();
