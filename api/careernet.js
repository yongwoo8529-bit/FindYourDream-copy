export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const apiKey = process.env.VITE_CAREERNET_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
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

        const response = await fetch(url);
        if (!response.ok) throw new Error(`커리어넷 응답 오류: ${response.status}`);

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(502).json({ error: '커리어넷 API 호출 실패', detail: err.message });
    }
}
