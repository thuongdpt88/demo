// Simple YouTube Search API Server + Static File Server
// This script provides YouTube search functionality for the kid_video app
// and serves the static files from the dist folder
// Run with: node youtube-api.mjs

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3002;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Serve static files
const serveStaticFile = (req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

  // Handle SPA routing - if file not found, serve index.html
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url === '/api/youtube-search' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { query } = JSON.parse(body);
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

        const options = {
          hostname: 'www.youtube.com',
          path: '/youtubei/v1/search?prettyPrint=false',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Length': Buffer.byteLength(requestBody)
          }
        };

        const ytReq = https.request(options, (ytRes) => {
          let data = '';
          ytRes.on('data', chunk => data += chunk);
          ytRes.on('end', () => {
            try {
              const jsonData = JSON.parse(data);
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
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                videos,
                totalResults: parseInt(jsonData?.estimatedResults || videos.length),
                source: 'youtube-internal'
              }));
            } catch (parseError) {
              console.error('❌ Parse error:', parseError.message);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Parse error', videos: [] }));
            }
          });
        });

        ytReq.on('error', (error) => {
          console.error('❌ YouTube request error:', error.message);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message, videos: [] }));
        });

        ytReq.setTimeout(15000, () => {
          ytReq.destroy();
          console.error('❌ Request timeout');
          res.statusCode = 504;
          res.end(JSON.stringify({ error: 'Timeout', videos: [] }));
        });

        ytReq.write(requestBody);
        ytReq.end();
      } catch (error) {
        console.error('❌ Error:', error.message);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message, videos: [] }));
      }
    });
  } else {
    // Serve static files for all other requests
    serveStaticFile(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`🎬 YouTube Search API + Static Server running at http://localhost:${PORT}`);
  console.log('📌 API Endpoint: POST /api/youtube-search');
  console.log(`📁 Serving static files from: ${DIST_DIR}`);
});
