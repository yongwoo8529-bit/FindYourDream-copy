const https = require('https');
const http = require('http');

function httpGet(url, hops) {
    if (hops > 5) return Promise.reject(new Error('리다이렉트 초과'));
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            // 301/302 리다이렉트 추적
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
                    const json = JSON.parse(body);
                    // 커리어넷 API 레벨 오류 감지 (code: "-1" 등)
                    if (json.code && json.code !== '0' && json.message) {
                        reject(new Error(`API 오류 [${json.code}]: ${json.message}`));
                        return;
                    }
                    resolve(json);
                } catch {
                    reject(new Error(`HTTP ${res.statusCode} / JSON 파싱 실패: ${body.slice(0, 300)}`));
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

    // data.go.kr 방식 키는 이미 URL 인코딩된 상태로 발급됨 → 디코딩 후 사용
    try { apiKey = decodeURIComponent(apiKey); } catch {}

    const { keyword, pageIndex = 1, pageCount = 20, seq } = req.query;

    try {
        let url;
        if (seq) {
            url = `https://www.career.go.kr/cnet/front/openapi/job.json`
                + `?apiKey=${encodeURIComponent(apiKey)}&seq=${encodeURIComponent(seq)}`;
        } else {
            const kw = keyword ? `&keyword=${encodeURIComponent(keyword)}` : '';
            url = `https://www.career.go.kr/cnet/front/openapi/jobs.json`
                + `?apiKey=${encodeURIComponent(apiKey)}&pageIndex=${pageIndex}&pageCount=${pageCount}${kw}`;
        }

        const data = await httpGet(url, 0);
        res.status(200).json(data);
    } catch (err) {
        res.status(502).json({ error: '커리어넷 API 호출 실패', detail: err.message });
    }
};
