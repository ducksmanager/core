FROM python:3.14-slim-trixie

RUN apt update && apt install -y --no-install-recommends libgl1 libglx-mesa0 libgomp1 libglib2.0-0 gcc python3-dev patch && apt clean

COPY apps/dumili/api/paddleocr/requirements.txt ./

RUN pip3 install -r requirements.txt
COPY --chmod=777 apps/dumili/api/paddleocr/server.py ./

ENTRYPOINT ["python3", "-u", "./server.py"]
