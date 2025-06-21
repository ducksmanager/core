FROM python:3.9-slim

RUN apt-get update && apt-get install -y --no-install-recommends git && apt-get clean
RUN git clone --depth 1 --single-branch https://github.com/njean42/kumiko

COPY apps/dumili/api/kumiko/requirements.txt ./
RUN pip3 install -r requirements.txt

COPY --chmod=777 apps/dumili/api/kumiko/server.py ./

ENTRYPOINT ["python3", "-u", "./server.py"]