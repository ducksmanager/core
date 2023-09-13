#!/usr/bin/env python

from paddle import utils
utils.run_check()
from paddleocr import PaddleOCR
from http.server import BaseHTTPRequestHandler, HTTPServer
import random
import json
import os
import base64

ocrFr = PaddleOCR(use_angle_cls=True, lang='french', cls_thresh=1)

class PaddleOCRRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length']) 
        base64Text = self.rfile.read(content_length)
        print(base64Text)

        file_name = ''.join((random.choice('abcdefghi') for i in range(5))) + '.png'
        try:
            file_content = base64.b64decode(base64Text)
            with open(file_name,"wb") as f:
                f.write(file_content)
        except Exception as e:
            print(str(e))

        result = ocrFr.ocr(file_name, cls=True)
        result = result[0]
        boxes = [line[0] for line in result]
        texts = [line[1][0] for line in result]
        scores = [line[1][1] for line in result]

        converted_data = []
        for i in range(len(boxes)):
            converted_item = {
                "box": boxes[i],
                "text": texts[i],
                "confidence": scores[i]
            }
            converted_data.append(converted_item)

        os.remove(file_name)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(converted_data).encode())

if __name__ == '__main__':
    host = '0.0.0.0'
    port = 8081
    server_address = (host, port)

    httpd = HTTPServer(server_address, PaddleOCRRequestHandler)
    print(f"Starting server on {host}:{port}...")
    httpd.serve_forever()