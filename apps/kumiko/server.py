#!/usr/bin/env python

import subprocess
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs

class KumikoRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = parse_qs(self.path[2:])

        self._run(params['i'][0].split(","))

    # The image itself, for callers holding an upload rather than a URL
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        with tempfile.NamedTemporaryFile(suffix='.jpg') as image:
            image.write(self.rfile.read(content_length))
            image.flush()
            self._run([image.name])

    def _run(self, inputs):
        result = subprocess.run(['python', './kumiko/kumiko', '-i'] + inputs, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stderr)
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write((result.stderr.strip().splitlines() or ['kumiko failed'])[-1].encode())
            return

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
