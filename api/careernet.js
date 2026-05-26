const https = require('https');
const http = require('http');

function httpGet(url, hops) {
    if (hops > 5) return Promise.reject(new Error('리다이렉트 초과'));
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                httpGet(res.headers.location, hops + 1).then(resolve).catch(reject);
                return;
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                try {
                    resolve(JSON.parse(body));
                } catch {
                    reject(new Error(`JSON 파싱 실패 [${res.statusCode}]: ${body.slice(0, 300)}`));
                }
            });
            res.on('error', reject);
        });
        req.setTimeout(15000, () => { req.destroy(new Error('타임아웃 (15s)')); });
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    let apiKey = process.env.VITE_CAREERNET_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'VITE_CAREERNET_API_KEY 없음' });

    // data.go.kr 방식 키는 이미 URL인코딩 상태로 발급됨 → 디코딩 후 재인코딩
    try { apiKey = decodeURIComponent(apiKey); } catch {}

    const { searchJobNm, pageIndex = 1, pageSize = 20, seq } = req.query;

    try {
        let url;
        if (seq) {
            // 직업 상세
            url = `https://www.career.go.kr/cnet/front/openapi/job.json`
                + `?apiKey=${encodeURIComponent(apiKey)}&seq=${encodeURIComponent(seq)}`;
        } else {
            // 직업 목록 — 올바른 파라미터명: searchJobNm, pageIndex, pageSize
            const kw = searchJobNm ? `&searchJobNm=${encodeURIComponent(searchJobNm)}` : '';
            url = `https://www.career.go.kr/cnet/front/openapi/jobs.json`
                + `?apiKey=${encodeURIComponent(apiKey)}&pageIndex=${pageIndex}&pageSize=${pageSize}${kw}`;
        }

        const data = await httpGet(url, 0);
        res.status(200).json(data);
    } catch (err) {
        res.status(502).json({ error: '커리어넷 API 호출 실패', detail: err.message });
    }
};
