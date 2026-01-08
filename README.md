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
docker build -t <image-name> -f ./.docker/prod/Dockerfile .
docker tag <image-name> <login>/<image-name>:<tag>
docker push <login>/<image-name>:<tag>
```

