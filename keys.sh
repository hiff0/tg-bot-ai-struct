#!/bin/bash
# generate-secrets.sh

echo "Генерация секретных ключей..."
echo ""

# Генерация ключей
HASH_SALT=$(openssl rand -hex 16)

echo "HASH_SALT=$HASH_SALT"
echo ""

echo "Добавьте эти значения в ваш .env файл!"

