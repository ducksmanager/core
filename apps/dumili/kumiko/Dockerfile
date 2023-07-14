FROM python:3-slim
RUN apt-get update && apt-get install -y --no-install-recommends git && apt-get clean
RUN git clone --depth 1 --single-branch https://github.com/njean42/kumiko
RUN pip3 install requests opencv-python-headless urllib3
COPY --chmod=777 server.py kumiko/server.py

# EXPOSE 8080
ENTRYPOINT ["./kumiko/server.py"]