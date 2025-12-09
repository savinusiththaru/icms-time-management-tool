const BASE_URL = 'http://localhost:3000';

async function testReport() {
    console.log('--- Testing Weekly Report API ---');

    // Use a known Monday
    const weekStart = '2023-10-02';

    try {
        const res = await fetch(`${BASE_URL}/api/reports/weekly?date=${weekStart}`);
        const json = await res.json();

        if (res.status === 200) {
            console.log('✅ API Success');
            console.log('Stats:', json.stats);
            console.log('Highlights:', json.highlights.length);
        } else {
            console.error('❌ API Failed', json);
        }

    } catch (e) { console.error(e); }
}

testReport();
