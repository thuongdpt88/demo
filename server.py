import http.server
import socketserver

PORT = 8000
HOST = "0.0.0.0"

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print(f"Serving at http://{HOST}:{PORT}")
    httpd.serve_forever()
