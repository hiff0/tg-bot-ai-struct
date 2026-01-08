import { BotError, Context } from 'grammy';
import { isDevelopment } from '@/config/env';
import logger from '@/lib/logger';

export async function errorHandler(err: BotError<Context>) {
  const error = err.error instanceof Error ? err.error : new Error(String(err.error));
  logger.error({ error }, '[ERROR]');

  const errorMessage = isDevelopment
    ? `Произошла ошибка:\n\n<code>${error.message}</code>`
    : 'Произошла ошибка при обработке запроса. Попробуйте позже.';

  await err.ctx.reply(errorMessage, { parse_mode: 'HTML' }).catch(() => {
    logger.error('Не удалось отправить сообщение об ошибке');
  });
}

