const https = require('https');
const http = require('http');

function get(url, redirects) {
    if (redirects > 5) return Promise.reject(new Error('리다이렉트 초과'));
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { timeout: 15000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                return get(res.headers.location, redirects + 1).then(resolve).catch(reject);
            }
            let body = '';
            res.on('data', chunk => (body += chunk));
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 400)}`));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch {
                    reject(new Error(`JSON 파싱 실패 — 응답: ${body.slice(0, 400)}`));
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('타임아웃 (15s)')); });
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const apiKey = process.env.VITE_CAREERNET_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'VITE_CAREERNET_API_KEY 환경변수 없음' });
    }

    const { keyword, pageIndex = 1, pageCount = 20, seq } = req.query;

    try {
        let url;
        if (seq) {
            url = `https://www.career.go.kr/cnet/front/openapi/job.json?apiKey=${apiKey}&seq=${encodeURIComponent(seq)}`;
        } else {
            const params = new URLSearchParams({ apiKey, pageIndex, pageCount });
            if (keyword) params.append('keyword', keyword);
            url = `https://www.career.go.kr/cnet/front/openapi/jobs.json?${params}`;
        }

        const data = await get(url, 0);
        res.json(data);
    } catch (err) {
        res.status(502).json({ error: '커리어넷 API 호출 실패', detail: err.message });
    }
};
