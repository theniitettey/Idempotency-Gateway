
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

async function runTest(name: string, fn: () => Promise<void>) {
    process.stdout.write(`running request: ${name} ... `);
    try {
        await fn();
        console.log('\x1b[32m%s\x1b[0m', 'PASSED');
    } catch (error: any) {
        console.log('\x1b[31m%s\x1b[0m', 'FAILED');
        console.error(error.message);
    }
}

async function testIdempotency() {
    const key = crypto.randomUUID();
    const body = { amount: 100, currency: 'USD' };

    console.log(`\nStarting Idempotency Tests (Key: ${key})\n`);

    // 1. Initial Request
    await runTest('1. Initial Request (Expect 200)', async () => {
        const res = await fetch(`${BASE_URL}/process-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': key
            },
            body: JSON.stringify(body)
        });

        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.message !== 'Charged 100 USD') throw new Error(`Unexpected body: ${JSON.stringify(data)}`);
    });

    // 2. Duplicate Request (Cache Hit)
    await runTest('2. Duplicate Request (Expect 200 + Cache Hit)', async () => {
        const res = await fetch(`${BASE_URL}/process-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': key
            },
            body: JSON.stringify(body)
        });

        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        if (res.headers.get('x-cache-hit') !== 'true') throw new Error('Missing X-Cache-Hit header');
        const data = await res.json();
        if (data.message !== 'Charged 100 USD') throw new Error(`Unexpected body: ${JSON.stringify(data)}`);
    });

    // 3. Different Body (Conflict)
    await runTest('3. Different Body (Expect 400)', async () => {
        const res = await fetch(`${BASE_URL}/process-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': key
            },
            body: JSON.stringify({ amount: 200, currency: 'USD' })
        });

        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    // 4. Concurrent Requests
    await runTest('4. Concurrent Requests (Expect In-Progress Handling)', async () => {
        const concurKey = crypto.randomUUID();
        const p1 = fetch(`${BASE_URL}/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': concurKey },
            body: JSON.stringify(body)
        });
        
        // Small delay to ensure first request hits server and creates entry
        await new Promise(r => setTimeout(r, 100));

        const p2 = fetch(`${BASE_URL}/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': concurKey },
            body: JSON.stringify(body)
        });

        const [r1, r2] = await Promise.all([p1, p2]);

        if (r1.status !== 200) throw new Error(`Req 1 failed with ${r1.status}`);
        if (r2.status !== 200) throw new Error(`Req 2 failed with ${r2.status}`);

        const t1 = await r1.json();
        const t2 = await r2.json();

        if (t1.message !== 'Charged 100 USD') throw new Error('Req 1 body mismatch');
        if (t2.message !== 'Charged 100 USD') throw new Error('Req 2 body mismatch');
        
        if (r2.headers.get('x-cache-hit') !== 'true') throw new Error('Req 2 should be cache hit (waited for result)');
    });

    // 5. Invalid Payload
    await runTest('5. Invalid Payload (Expect 400)', async () => {
        const res = await fetch(`${BASE_URL}/process-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': crypto.randomUUID()
            },
            body: JSON.stringify({ amount: 'invalid' })
        });

        if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    });

    // 6. Server Health Check (Verify no crash)
    await runTest('6. Server Health Check (Verify Up)', async () => {
        const res = await fetch(`${BASE_URL}/`, { method: 'GET' });
        if (res.status !== 200) throw new Error(`Server seems down, got ${res.status}`);
    });
}

testIdempotency().catch(console.error);
