import http.server
import socketserver
import urllib.parse
import json
import random
import sys
import os
from datetime import datetime, timedelta

# Thêm đường dẫn cài đặt thư viện vào sys.path
sys.path.append(os.path.expanduser("~/.local/lib/python3.10/site-packages"))

try:
    import pandas as pd
except ImportError as e:
    pd = None
    print(f"Pandas chưa được cài đặt: {e}, tiếp tục không dùng pandas.")

# Thử import vnstock v3
try:
    from vnstock import Quote, Finance
    VNSTOCK_AVAILABLE = True
    print("Vnstock v3 đã sẵn sàng.")
except ImportError as e:
    VNSTOCK_AVAILABLE = False
    print(f"Vnstock chưa được cài đặt hoặc lỗi import: {e}, sử dụng giả lập.")

PORT = 8000
HOST = "0.0.0.0"

BASE_PRICES = {
    'VIC': 43.5, 'VHM': 41.2, 'FPT': 96.8, 'VNM': 67.5,
    'TCB': 34.2, 'VCB': 91.0, 'HPG': 28.5, 'MWG': 45.3
}

class UnifiedHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/"):
            self.handle_api()
        else:
            # Serve static files
            super().do_GET()

    def handle_api(self):
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)

        try:
            if parsed_path.path == "/api/quote":
                tickers = query_params.get('tickers', [''])[0]
                data = self.get_latest_prices(tickers)
                self.send_json(data)

            elif parsed_path.path == "/api/history":
                ticker = query_params.get('ticker', [''])[0]
                data = self.get_history(ticker)
                self.send_json(data)

            elif parsed_path.path == "/api/stats":
                ticker = query_params.get('ticker', [''])[0]
                data = self.get_stats(ticker)
                self.send_json(data)
            else:
                self.send_error(404)
        except Exception as e:
            print(f"Lỗi API: {e}")
            self.send_error(500, str(e))

    def get_latest_prices(self, tickers):
        if VNSTOCK_AVAILABLE:
            results = []
            for t in tickers.split(','):
                try:
                    q = Quote(symbol=t, source='VCI')
                    df = q.history(count_back=2)
                    if not df.empty:
                        last = df.iloc[-1]
                        prev = df.iloc[-2] if len(df) > 1 else last

                        price = float(last['close'])
                        ref = float(prev['close'])
                        change_percent = (price - ref) / ref if ref != 0 else 0

                        results.append({
                            "ticker": t,
                            "price": price * 1000,
                            "basicPrice": ref * 1000,
                            "dayChangePercent": change_percent
                        })
                except Exception as e:
                    print(f"Lỗi lấy giá cho {t}: {e}")

            if results:
                return {"data": results, "source": "vnstock (VCI)"}

        # Fallback
        results = []
        for t in tickers.split(','):
            base = BASE_PRICES.get(t, 50.0)
            change = random.uniform(-0.02, 0.02)
            price = base * (1 + change)
            results.append({
                "ticker": t,
                "price": price * 1000,
                "basicPrice": base * 1000,
                "dayChangePercent": change
            })
        return {"data": results, "source": "giả lập (fallback)"}

    def get_history(self, ticker):
        if VNSTOCK_AVAILABLE:
            try:
                q = Quote(symbol=ticker, source='VCI')
                df = q.history(count_back=100)

                data = []
                time_col = 'time' if 'time' in df.columns else (df.index.name if df.index.name else 'time')

                if time_col not in df.columns and time_col != df.index.name:
                    df = df.reset_index()
                    time_col = 'time' if 'time' in df.columns else df.columns[0]

                for _, row in df.iterrows():
                    data.append({
                        "tradingDate": str(row[time_col]),
                        "close": float(row['close']) * 1000
                    })
                return {"data": data, "source": "vnstock (VCI)"}
            except Exception as e:
                print(f"Lỗi lịch sử cho {ticker}: {e}")

        # Fallback
        data = []
        base = BASE_PRICES.get(ticker, 50.0)
        curr = base
        now = datetime.now()
        for i in range(100):
            d = now - timedelta(days=i)
            if d.weekday() < 5:
                change = random.uniform(-0.03, 0.03)
                curr = curr * (1 + change)
                data.append({
                    "tradingDate": d.strftime("%Y-%m-%dT00:00:00Z"),
                    "close": curr * 1000
                })
        return {"data": data, "source": "giả lập"}

    def get_stats(self, ticker):
        if VNSTOCK_AVAILABLE:
            try:
                f = Finance(symbol=ticker, source='VCI')
                df = f.ratio(period='year')
                if not df.empty:
                    latest = df.iloc[-1]
                    stats = {}

                    def get_val(lvl1, lvl2):
                        try:
                            return float(latest[(lvl1, lvl2)])
                        except:
                            return None

                    stats['pe'] = get_val('Chỉ tiêu định giá', 'P/E')
                    stats['pb'] = get_val('Chỉ tiêu định giá', 'P/B')
                    stats['roe'] = get_val('Chỉ tiêu hiệu quả hoạt động', 'ROE')
                    stats['marketCap'] = get_val('Chỉ tiêu định giá', 'Market Capital (Bn. VND)')
                    stats['eps'] = get_val('Chỉ tiêu định giá', 'EPS (VND)')

                    return {"data": stats, "source": "vnstock (VCI)"}
            except Exception as e:
                print(f"Lỗi lấy stats cho {ticker}: {e}")

        # Fallback
        return {
            "data": {
                "pe": random.uniform(8, 20),
                "pb": random.uniform(0.8, 3.0),
                "roe": random.uniform(0.1, 0.25),
                "marketCap": random.randint(10000, 500000),
                "eps": random.randint(2000, 8000)
            },
            "source": "giả lập"
        }

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

print(f"Server tích hợp (Web + Stock API) đang chạy tại: http://{HOST}:{PORT}")
print(f"- Trang chính: http://localhost:{PORT}")
print(f"- Stock App: http://localhost:{PORT}/stock/")
print(f"- API: http://localhost:{PORT}/api/quote?tickers=VIC")

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer((HOST, PORT), UnifiedHandler) as httpd:
    httpd.serve_forever()
