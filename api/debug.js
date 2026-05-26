const https = require('https');
const http = require('http');

function apiCall(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                return apiCall(res.headers.location).then(resolve);
            }
            const chunks = [];
            res.on('data', d => chunks.push(d));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                let parsed = null;
                try { parsed = JSON.parse(body); } catch {}
                resolve({ status: res.statusCode, body: body.slice(0, 800), parsed });
            });
            res.on('error', e => resolve({ status: 'READ_ERR', msg: e.message }));
        });
        req.setTimeout(12000, () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
        req.on('error', e => resolve({ status: 'CONN_ERR', msg: e.message }));
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const rawKey = process.env.VITE_CAREERNET_API_KEY || '';
    let decodedKey = rawKey;
    try { decodedKey = decodeURIComponent(rawKey); } catch {}

    const base = 'https://www.career.go.kr/cnet/front/openapi/jobs.json';

    const test1 = await apiCall(`${base}?apiKey=${rawKey}&pageIndex=1&pageSize=3`);
    const test2 = await apiCall(`${base}?apiKey=${encodeURIComponent(decodedKey)}&pageIndex=1&pageSize=3`);

    res.status(200).json({
        nodeVersion: process.version,
        hasApiKey: !!rawKey,
        keyLen: rawKey.length,
        keyPrefix: rawKey.slice(0, 10) + '...',
        keyContainsPercent: rawKey.includes('%'),
        decodedKeyPrefix: decodedKey.slice(0, 10) + '...',
        test_raw: test1,
        test_decoded_encoded: test2,
    });
};
