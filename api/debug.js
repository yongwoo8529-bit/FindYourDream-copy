const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 1) 환경변수 확인
    const apiKey = process.env.VITE_CAREERNET_API_KEY;

    // 2) career.go.kr TCP 연결 테스트
    const reachable = await new Promise((resolve) => {
        const r = https.get('https://www.career.go.kr', { timeout: 5000 }, (resp) => {
            resp.resume();
            resolve(`HTTP ${resp.statusCode}`);
        });
        r.on('timeout', () => { r.destroy(); resolve('TIMEOUT'); });
        r.on('error', (e) => resolve(`ERROR: ${e.message}`));
    });

    // 3) API 엔드포인트 직접 호출 (키 미포함)
    const apiCheck = await new Promise((resolve) => {
        const r = https.get(
            `https://www.career.go.kr/cnet/front/openapi/jobs.json?apiKey=${apiKey || 'NO_KEY'}&pageIndex=1&pageCount=1`,
            { timeout: 10000 },
            (resp) => {
                let body = '';
                resp.on('data', d => body += d);
                resp.on('end', () => resolve({ status: resp.statusCode, body: body.slice(0, 300) }));
            }
        );
        r.on('timeout', () => { r.destroy(); resolve({ status: 'TIMEOUT' }); });
        r.on('error', (e) => resolve({ status: 'ERROR', msg: e.message }));
    });

    res.status(200).json({
        nodeVersion: process.version,
        hasApiKey: !!apiKey,
        careerGoKrReachable: reachable,
        apiTest: apiCheck,
    });
};
