# Girl Bot

## Быстрый старт

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

## Local
Generate keys
```bash
./keys.sh
```

## Релиз
```bash
docker build -t girl-bot -f ./.docker/prod/Dockerfile .
docker tag girl-bot hiff/girl-bot:<tag>
docker push hiff/girl-bot:<tag>
```

