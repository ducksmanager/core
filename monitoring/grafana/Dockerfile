# Multi-target build for the monitoring server stack. Each target bakes its
# config into the upstream image so deploys only need to ship docker-compose.yml.
# Build context is the repo root (see prod:build-docker in ~ci).

FROM grafana/grafana:latest AS grafana
LABEL org.opencontainers.image.authors="Bruno Perel"
COPY monitoring/grafana/grafana.ini /etc/grafana/grafana.ini
COPY monitoring/grafana/provisioning /etc/grafana/provisioning
COPY monitoring/grafana/dashboards /etc/grafana/dashboards

FROM prom/prometheus:latest AS prometheus
LABEL org.opencontainers.image.authors="Bruno Perel"
COPY monitoring/grafana/prometheus /etc/prometheus

FROM grafana/loki:latest AS loki
LABEL org.opencontainers.image.authors="Bruno Perel"
COPY monitoring/grafana/loki/loki-config.yaml /etc/loki/loki-config.yaml

FROM prom/blackbox-exporter:latest AS blackbox
LABEL org.opencontainers.image.authors="Bruno Perel"
COPY monitoring/grafana/blackbox/blackbox.yml /etc/blackbox/blackbox.yml

FROM quay.io/prometheuscommunity/json-exporter:latest AS json-exporter
LABEL org.opencontainers.image.authors="Bruno Perel"
COPY monitoring/grafana/json-exporter/config.yml /etc/json-exporter/config.yml

FROM grafana/tempo:2.10.7 AS tempo
LABEL org.opencontainers.image.authors="Bruno Perel"
COPY monitoring/grafana/tempo/tempo.yaml /etc/tempo/tempo.yaml
