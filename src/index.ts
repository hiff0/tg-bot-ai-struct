import { createBot } from '@/bot';
import { isDevelopment } from '@/config/env';
import { redisStorage } from '@/storage/redis';
import { loadMessagesToRedis } from '@/lib/messages-loader';
import { postgresStorage } from '@/storage/postgres';
import logger from '@/lib/logger';
import { GrammyError, HttpError } from 'grammy';

async function main() {
  logger.info('Starting Girl Bot...');
  logger.info(`Mode: ${isDevelopment ? 'development' : 'production'}`);

  await redisStorage.connect();
  await postgresStorage.connect();

  await loadMessagesToRedis();

  const { bot } = createBot();

  const commands = [
    { command: 'restart', description: '🔄 Перезапустить бота' },
  ];
  
  await bot.api.setMyCommands(commands);
  await bot.api.setMyDescription('Привет 👋 Я — Girl Bot.');

  await bot.start({
    onStart: () => {
      logger.info('Бот готов к работе!');
    },
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      logger.error(`Ошибка в запросе: ${e.description}`);
    } else if (e instanceof HttpError) {
      logger.error(`Не удалось связаться с Telegram: ${e}`);
    } else {
      logger.error(`Неизвестная ошибка: ${e}`);
    }
  });
}

main().catch((error) => {
  logger.error('Критическая ошибка при запуске бота:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Остановка бота...');
  await redisStorage.disconnect();
  await postgresStorage.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Остановка бота...');
  await redisStorage.disconnect();
  await postgresStorage.disconnect();
  process.exit(0);
});

