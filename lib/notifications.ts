/**
 * Stub for sending notifications (Email, Push, In-App).
 * In production, this would integrate with SendGrid, Twilio, Firebase, etc.
 */
export async function sendNotification(userId: string, type: 'ASSIGNED' | 'REMINDER' | 'GENERATED', payload: any) {
    // Simulate delay
    // await new Promise(r => setTimeout(r, 100));

    console.log(`\n[NOTIFICATION] To User: ${userId}`);
    console.log(`[TYPE] ${type}`);
    console.log(`[PAYLOAD]`, JSON.stringify(payload, null, 2));
    console.log('-------------------------------------------');
}
