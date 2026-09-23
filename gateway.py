"""
Port 80 HTTP Gateway for globalsetu.com
Forwards standard HTTP traffic on port 80 directly to Vite Frontend and Flask Backend
"""
import sys
import http.server
import socketserver
import urllib.request
import urllib.error

PORT = 80
VITE_UPSTREAM = 'http://127.0.0.1:5173'
FLASK_UPSTREAM = 'http://127.0.0.1:5000'

class ReverseProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.proxy_request('GET')

    def do_POST(self):
        self.proxy_request('POST')

    def do_PUT(self):
        self.proxy_request('PUT')

    def do_PATCH(self):
        self.proxy_request('PATCH')

    def do_DELETE(self):
        self.proxy_request('DELETE')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def proxy_request(self, method):
        # Route /api to Flask, everything else to Vite
        upstream = FLASK_UPSTREAM if self.path.startswith('/api') else VITE_UPSTREAM
        target_url = f"{upstream}{self.path}"

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        headers = {}
        for k, v in self.headers.items():
            if k.lower() not in ['host', 'content-length']:
                headers[k] = v

        try:
            req = urllib.request.Request(target_url, data=body, headers=headers, method=method)
            with urllib.request.urlopen(req) as resp:
                self.send_response(resp.status)
                for header, value in resp.headers.items():
                    if header.lower() not in ['transfer-encoding', 'content-length']:
                        self.send_header(header, value)
                content = resp.read()
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for header, value in e.headers.items():
                if header.lower() not in ['transfer-encoding', 'content-length']:
                    self.send_header(header, value)
            content = e.read()
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(f"Gateway Error: {e}".encode())

    def log_message(self, format, *args):
        # Suppress noisy logs
        return

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), ReverseProxyHandler) as httpd:
        print(f"===========================================================")
        print(f" GLOBAL-SETU DOMAIN GATEWAY RUNNING ON PORT {PORT}")
        print(f" Domain: http://globalsetu.com/")
        print(f" Network: http://172.42.0.165/")
        print(f"===========================================================")
        httpd.serve_forever()

if __name__ == '__main__':
    run()
