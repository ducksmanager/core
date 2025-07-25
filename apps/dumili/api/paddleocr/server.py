#!/usr/bin/env python

from paddle import utils
utils.run_check()
from paddleocr import PaddleOCR
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import numpy as np

# select countrycode, GROUP_CONCAT(languagecode ORDER BY entries_with_language DESC) AS languages
# from (select countrycode, coalesce(inducks_entry.languagecode, ip.languagecode) as languagecode, count(*) as entries_with_language
#       from inducks_entry
#                inner join inducks_issue using (issuecode)
#                inner join inducks_publication ip using (publicationcode)
#       group by countrycode, coalesce(inducks_entry.languagecode, ip.languagecode) ORDER BY countrycode) as country_and_language
# group by countrycode

json_string = """
[
  {
    "countrycode": "ae",
    "languages": "ar,en"
  },
  {
    "countrycode": "al",
    "languages": "sq"
  },
  {
    "countrycode": "ar",
    "languages": "es-ar"
  },
  {
    "countrycode": "at",
    "languages": "de"
  },
  {
    "countrycode": "au",
    "languages": "en"
  },
  {
    "countrycode": "be",
    "languages": "nl-be,fr-be,fr,nl,af,la,en"
  },
  {
    "countrycode": "bg",
    "languages": "bg"
  },
  {
    "countrycode": "br",
    "languages": "pt-br,en"
  },
  {
    "countrycode": "by",
    "languages": "be"
  },
  {
    "countrycode": "ca",
    "languages": "fr-ca,fr,en"
  },
  {
    "countrycode": "ch",
    "languages": "fr,de"
  },
  {
    "countrycode": "cl",
    "languages": "es-cl,es"
  },
  {
    "countrycode": "cn",
    "languages": "zh-hans,en,it,fr,de,es,zh-hant,sr-cyrl,nl"
  },
  {
    "countrycode": "co",
    "languages": "es-co"
  },
  {
    "countrycode": "cz",
    "languages": "cs,en,zh-hans,ja"
  },
  {
    "countrycode": "dc",
    "languages": "en"
  },
  {
    "countrycode": "de",
    "languages": "de,en,fr,it,es,nl,da,fi,no,la,pt-br,ar,uk,nde,bg,sv,is,sl,pt,sr-cyrl,zh-hans,el,hr,ru,cs,ja,eo,tr,pl"
  },
  {
    "countrycode": "dk",
    "languages": "da,en,sv,de,zh-hans,ja,fi"
  },
  {
    "countrycode": "dz",
    "languages": "fr"
  },
  {
    "countrycode": "ee",
    "languages": "et,en"
  },
  {
    "countrycode": "eg",
    "languages": "ar,en"
  },
  {
    "countrycode": "es",
    "languages": "es,es-co,en,it,fr"
  },
  {
    "countrycode": "fi",
    "languages": "fi,en,sv,de,nl,se-sme,se-sms,it,se-smn,fr,ru,et,pt,es,no,da"
  },
  {
    "countrycode": "fo",
    "languages": "fo,en"
  },
  {
    "countrycode": "fr",
    "languages": "fr,en,es,de,ar,it,la,ru,sr-cyrl,nl,el,hi"
  },
  {
    "countrycode": "gr",
    "languages": "el,en,it,fr,nl"
  },
  {
    "countrycode": "gy",
    "languages": "en"
  },
  {
    "countrycode": "hk",
    "languages": "zh-hant,en,sq"
  },
  {
    "countrycode": "hr",
    "languages": "hr"
  },
  {
    "countrycode": "hu",
    "languages": "hu"
  },
  {
    "countrycode": "id",
    "languages": "id,en"
  },
  {
    "countrycode": "ie",
    "languages": "en,af"
  },
  {
    "countrycode": "il",
    "languages": "he"
  },
  {
    "countrycode": "in",
    "languages": "en,hi,bn,ta,as,ml,kn"
  },
  {
    "countrycode": "ir",
    "languages": "fa"
  },
  {
    "countrycode": "is",
    "languages": "is"
  },
  {
    "countrycode": "it",
    "languages": "it,en,fr,la,de,fi,no,zh-hant,eo,sv"
  },
  {
    "countrycode": "jp",
    "languages": "ja,en"
  },
  {
    "countrycode": "kr",
    "languages": "ko"
  },
  {
    "countrycode": "kw",
    "languages": "ar,ur"
  },
  {
    "countrycode": "lb",
    "languages": "ar"
  },
  {
    "countrycode": "lt",
    "languages": "lt"
  },
  {
    "countrycode": "lu",
    "languages": "ltz"
  },
  {
    "countrycode": "lv",
    "languages": "lv,ru-lv"
  },
  {
    "countrycode": "ma",
    "languages": "fr"
  },
  {
    "countrycode": "mk",
    "languages": "mk"
  },
  {
    "countrycode": "mn",
    "languages": "mn"
  },
  {
    "countrycode": "mx",
    "languages": "es-mx"
  },
  {
    "countrycode": "my",
    "languages": "zh-hans,ms,en"
  },
  {
    "countrycode": "nl",
    "languages": "nl,en,fy,nl-be,lim,it,sv,fr,el,de,ja"
  },
  {
    "countrycode": "no",
    "languages": "no,se-sme,en,nn,da,se-sma,sv,se-smj,fr,fo"
  },
  {
    "countrycode": "nz",
    "languages": "en"
  },
  {
    "countrycode": "ph",
    "languages": "en,tl"
  },
  {
    "countrycode": "pl",
    "languages": "pl,en,de,fi,ja"
  },
  {
    "countrycode": "pt",
    "languages": "pt,pt-br,en"
  },
  {
    "countrycode": "ro",
    "languages": "ro,en"
  },
  {
    "countrycode": "rs",
    "languages": "sr-cyrl,af,sr-latn"
  },
  {
    "countrycode": "ru",
    "languages": "ru,en"
  },
  {
    "countrycode": "sa",
    "languages": "ar"
  },
  {
    "countrycode": "se",
    "languages": "sv,en,it,de,da,no,fi,fr,el,ja,es,zh-hans,hu,nl,tr,hr,lv,he,la,ru,ar,pt-br,pl,is"
  },
  {
    "countrycode": "sg",
    "languages": "en"
  },
  {
    "countrycode": "si",
    "languages": "sl"
  },
  {
    "countrycode": "sk",
    "languages": "sk"
  },
  {
    "countrycode": "th",
    "languages": "th,en"
  },
  {
    "countrycode": "tn",
    "languages": "fr"
  },
  {
    "countrycode": "tr",
    "languages": "tr"
  },
  {
    "countrycode": "tw",
    "languages": "zh-hant"
  },
  {
    "countrycode": "ua",
    "languages": "uk,ru,en"
  },
  {
    "countrycode": "uk",
    "languages": "en,fr"
  },
  {
    "countrycode": "us",
    "languages": "en,it,fr,nl,de,sv,sr-cyrl,pt-br,pt,fi,es,ja,da"
  },
  {
    "countrycode": "ve",
    "languages": "es"
  },
  {
    "countrycode": "vn",
    "languages": "vi"
  },
  {
    "countrycode": "yu",
    "languages": "sr-cyrl,sl,sr-latn,hr,en,it"
  },
  {
    "countrycode": "za",
    "languages": "en,af"
  }
]
"""

data = json.loads(json_string)

country_languages = {}
for item in data:
    country_languages[item['countrycode']] = item['languages'].split(',')

# https://github.com/PaddlePaddle/PaddleOCR/issues/1048
ocr_languages = {
    lang: PaddleOCR(use_textline_orientation=True, lang=lang)
    for lang in ['french']
}

def convert_numpy_to_python(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_to_python(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_to_python(item) for item in obj]
    return obj

class PaddleOCRRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length))
        url = post_data['url'].replace('upload/', 'upload/c_limit,h_4000,w_4000/')
        language = post_data['language']

        os.remove("tmp.jpg") if os.path.exists("tmp.jpg") else None
        result = ocr_languages[language].predict(url)
        result = result[0]

        converted_data = []
        
        # Print result as JSON string
        if result is not None:
          # Extract texts and scores from the result structure
          texts = result['rec_texts']
          scores = result['rec_scores']
          boxes = result['rec_boxes']

          for i in range(len(texts)):
              if texts[i]:  # Only include non-empty texts
                  # Format box coordinates as [x1, y1, x2, y2]
                  box = boxes[i]
                  # The box is a 1D array of 4 values: [x1,y1,x2,y2]
                  formatted_box = [
                      int(box[0]),  # x1
                      int(box[1]),  # y1
                      int(box[2]),  # x2
                      int(box[3])   # y2
                  ]
                  converted_item = {
                      "box": formatted_box,
                      "text": texts[i],
                      "confidence": float(scores[i])  # Convert numpy float to Python float
                  }
                  converted_data.append(converted_item)

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