FROM python:3.9-slim AS libs
RUN apt update && apt install -y --no-install-recommends wget make gcc perl build-essential patch && apt clean
WORKDIR /home

RUN wget https://www.openssl.org/source/openssl-1.1.1v.tar.gz
RUN tar -zxvf openssl-1.1.1v.tar.gz
RUN cd openssl-1.1.1v && ./config && make -j$(nproc)

FROM python:3.9-slim

RUN apt update && apt install -y --no-install-recommends libgl1-mesa-glx libgomp1 libglib2.0-0 gcc python3-dev patch && apt clean

COPY --from=libs /home/openssl-1.1.1v/libcrypto.so.1.1 /lib/
COPY --from=libs /home/openssl-1.1.1v/libssl.so.1.1 /lib/
COPY apps/dumili/api/paddleocr/requirements.txt ./

RUN pip3 install -r requirements.txt
COPY --chmod=777 apps/dumili/api/paddleocr/server.py ./

ENTRYPOINT ["python3", "-u", "./server.py"]
