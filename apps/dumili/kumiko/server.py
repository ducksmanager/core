#!/usr/bin/env python

import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs

class KumikoRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = parse_qs(self.path[2:])

        result = subprocess.run(['python', './kumiko/kumiko', '-i'] + params['i'][0].split(","), capture_output=True, text=True)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(result.stdout.encode())


if __name__ == '__main__':
    host = '0.0.0.0'
    port = 8080
    server_address = (host, port)

    httpd = HTTPServer(server_address, KumikoRequestHandler)
    print(f"Starting server on {host}:{port}...")
    httpd.serve_forever()