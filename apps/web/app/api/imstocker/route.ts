import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { search, sessionId, offset = 0, count = 100, type = null } = body;

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    };

    const makeRequest = async (currentOffset: number, currentCount: number) => {
        const payload: any = {
          options: { offset: currentOffset, count: currentCount },
          id_language: "1",
          query: {
            text: search,
            licenseType: null,
            type: type,
            hasModels: false,
            microstock: null,
            author: null,
            exclude: null
          },
          target: "site"
        };

        if (sessionId) {
            if (sessionId.includes(':')) {
                payload.access_token = sessionId;
            } else {
                payload.keyworder_session = sessionId;
            }
        }

        const res = await fetch('https://api.imstocker.com/api/search/searchWorks', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error(`API returned status ${res.status}`);
        
        const data = await res.json();
        if (data.error) {
            throw new Error(`IMStocker Error (${data.error.code || 'API Limit'}): ${data.error.message || 'Rate limit exceeded'}`);
        }
        
        return data;
    };

    if (count <= 50) {
        const data = await makeRequest(offset, count);
        return NextResponse.json(data);
    } else {
        // IMStocker API caps at 50 results per request.
        // We need to paginate automatically and merge the results.
        const promises = [];
        let currentOffset = offset;
        let remainingCount = count;
        
        while (remainingCount > 0) {
            const fetchCount = Math.min(remainingCount, 50);
            promises.push(makeRequest(currentOffset, fetchCount));
            currentOffset += fetchCount;
            remainingCount -= fetchCount;
        }
        
        const results = await Promise.all(promises);
        
        let mergedList: any[] = [];
        let total = 0;
        
        results.forEach((data) => {
            if (data?.res?.list) {
                mergedList = [...mergedList, ...data.res.list];
            }
            if (data?.res?.total !== undefined) {
                total = data.res.total;
            }
        });
        
        return NextResponse.json({ res: { list: mergedList, total } });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
