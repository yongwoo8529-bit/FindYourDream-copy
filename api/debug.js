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
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: body.slice(0, 400) }));
            res.on('error', e => resolve({ status: 'READ_ERR', msg: e.message }));
        });
        req.setTimeout(10000, () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
        req.on('error', e => resolve({ status: 'CONN_ERR', msg: e.message }));
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const rawKey = process.env.VITE_CAREERNET_API_KEY || '';
    let decodedKey = rawKey;
    try { decodedKey = decodeURIComponent(rawKey); } catch {}

    const base = 'https://www.career.go.kr/cnet/front/openapi/jobs.json';

    // 방법 1: raw 키 그대로
    const test1 = await apiCall(`${base}?apiKey=${rawKey}&pageIndex=1&pageCount=1`);
    // 방법 2: 디코딩 후 encodeURIComponent
    const test2 = await apiCall(`${base}?apiKey=${encodeURIComponent(decodedKey)}&pageIndex=1&pageCount=1`);

    res.status(200).json({
        nodeVersion: process.version,
        hasApiKey: !!rawKey,
        keyPrefix: rawKey.slice(0, 8) + '...',       // 키 앞 8자 확인용
        keyContainsPercent: rawKey.includes('%'),      // 이미 URL인코딩 됐는지
        test_raw: test1,
        test_decoded_then_encoded: test2,
    });
};
