FROM python:3.13-slim-trixie

RUN apt update && apt install -y --no-install-recommends libgl1 libglx-mesa0 libgomp1 libglib2.0-0 gcc python3-dev patch && apt clean

COPY apps/paddleocr/requirements.txt ./

RUN pip3 install -r requirements.txt
COPY apps/paddleocr/recognition_model_rules.json ./
COPY --chmod=777 apps/paddleocr/server.py ./

ENTRYPOINT ["python3", "-u", "./server.py"]
