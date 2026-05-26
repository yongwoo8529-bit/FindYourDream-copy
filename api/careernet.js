import https from 'https';
import http from 'http';

function request(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { timeout: 10000 }, (res) => {
            let body = '';
            res.on('data', chunk => (body += chunk));
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode} — ${body.slice(0, 300)}`));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch {
                    reject(new Error(`JSON 파싱 실패 (응답: ${body.slice(0, 300)})`));
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('요청 시간 초과 (10s)')); });
    });
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const apiKey = process.env.VITE_CAREERNET_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'VITE_CAREERNET_API_KEY 환경변수가 없습니다.' });
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

        const data = await request(url);
        res.json(data);
    } catch (err) {
        res.status(502).json({ error: '커리어넷 API 호출 실패', detail: err.message });
    }
}
