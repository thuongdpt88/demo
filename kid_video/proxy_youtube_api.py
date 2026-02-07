import http.server
import socketserver
import os
import json
import urllib.request
import urllib.error

PORT = int(os.environ.get('PORT', 8000))

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/youtube-search':
            self.proxy_youtube_search()
        else:
            self.send_error(404, 'Not Found')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def proxy_youtube_search(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            query = body.get('query', '')

            print(f'🔍 Searching YouTube: {query}')

            request_body = json.dumps({
                'context': {
                    'client': {
                        'hl': 'vi',
                        'gl': 'VN',
                        'clientName': 'WEB',
                        'clientVersion': '2.20240101.00.00'
                    }
                },
                'query': query
            }).encode('utf-8')

            req = urllib.request.Request(
                'https://www.youtube.com/youtubei/v1/search?prettyPrint=false',
                data=request_body,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                yt_data = json.loads(response.read().decode('utf-8'))

            videos = []
            try:
                contents = yt_data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
                for section in contents:
                    items = section.get('itemSectionRenderer', {}).get('contents', [])
                    for item in items:
                        video = item.get('videoRenderer')
                        if video:
                            video_id = video.get('videoId')
                            title = video.get('title', {}).get('runs', [{}])[0].get('text', '')
                            thumbnail = video.get('thumbnail', {}).get('thumbnails', [{}])[-1].get('url', '')
                            channel = video.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                            if video_id and title:
                                videos.append({
                                    'id': video_id,
                                    'videoId': video_id,
                                    'url': f'https://www.youtube.com/watch?v={video_id}',
                                    'title': title,
                                    'thumbnail': f'https://img.youtube.com/vi/{video_id}/mqdefault.jpg',
                                    'channel': channel
                                })
                                if len(videos) >= 20:
                                    break
                    if len(videos) >= 20:
                        break
            except Exception as e:
                print(f'Parse error: {e}')

            result = json.dumps({'videos': videos, 'totalResults': len(videos)})

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(result.encode('utf-8'))
            print(f'✅ Found {len(videos)} videos')

        except Exception as e:
            print(f'❌ YouTube API error: {e}')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e), 'videos': []}).encode('utf-8'))

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(('0.0.0.0', PORT), ProxyHandler) as httpd:
    print(f'Serving at http://0.0.0.0:{PORT}')
    httpd.serve_forever()
