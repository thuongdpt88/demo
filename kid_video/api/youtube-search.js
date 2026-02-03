// Vercel Serverless Function for YouTube Search API
// This function proxies requests to YouTube Internal API to bypass CORS

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required', videos: [] });
    }

    console.log('🔍 Searching YouTube:', query);

    const requestBody = JSON.stringify({
      context: {
        client: {
          hl: 'vi',
          gl: 'VN',
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00'
        }
      },
      query: query
    });

    const ytResponse = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: requestBody
    });

    if (!ytResponse.ok) {
      throw new Error(`YouTube API error: ${ytResponse.status}`);
    }

    const jsonData = await ytResponse.json();
    const videos = [];
    const contents = jsonData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    for (const section of contents) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (videoId) {
            videos.push({
              id: videoId,
              videoId: videoId,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              title: v.title?.runs?.[0]?.text || 'Unknown',
              thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              channel: v.ownerText?.runs?.[0]?.text || 'Unknown',
              duration: v.lengthText?.simpleText || '',
              viewCount: v.viewCountText?.simpleText || ''
            });
          }
        }
        if (videos.length >= 20) break;
      }
      if (videos.length >= 20) break;
    }

    console.log('✅ Found', videos.length, 'videos');

    return res.status(200).json({
      videos,
      totalResults: parseInt(jsonData?.estimatedResults || videos.length),
      source: 'youtube-internal'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message, videos: [] });
  }
}
