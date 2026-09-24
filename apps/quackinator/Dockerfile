FROM python:3.11-slim
LABEL org.opencontainers.image.authors="Bruno Perel"
WORKDIR /app

COPY apps/quackinator/pyproject.toml /app/
COPY apps/quackinator/src /app/src

RUN pip install --no-cache-dir .

# The built index, not the database. The ETL is an offline job against `coa`
# (see docker-compose.yml); everything the API serves comes out of `data/index`,
# which is why this container never needs dm-db-network.
ENV QUACKINATOR_INDEX_DIR=/app/data/index

EXPOSE 8000
CMD ["uvicorn", "quackinator.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
