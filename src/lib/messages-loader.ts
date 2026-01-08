import { readFileSync } from 'fs';
import { join } from 'path';
import { redisStorage } from '@/storage/redis';
import logger from '@/lib/logger';

interface MessagesFile {
  messages: {
    [lang: string]: {
      [key: string]: string;
    };
  };
  keyboardMessages: {
    [lang: string]: {
      [key: string]: string;
    };
  };
}

export async function loadMessagesToRedis(): Promise<void> {
  try {
    logger.info('Загрузка сообщений в Redis...');

    const messagesPath = join(process.cwd(), 'messages.json');
    const messagesJson = readFileSync(messagesPath, 'utf-8');
    const data: MessagesFile = JSON.parse(messagesJson);

    let totalCount = 0;

    // Загружаем обычные сообщения
    for (const [lang, langMessages] of Object.entries(data.messages)) {
      for (const [key, value] of Object.entries(langMessages)) {
        await redisStorage.setMessage(key, value, lang);
        totalCount++;
      }
    }

    // Загружаем сообщения для клавиатур
    for (const [lang, langMessages] of Object.entries(data.keyboardMessages)) {
      for (const [key, value] of Object.entries(langMessages)) {
        await redisStorage.setKeyboardMessage(key, value, lang);
        totalCount++;
      }
    }

    logger.info(`Загружено ${totalCount} сообщений в Redis`);
  } catch (error) {
    logger.error({ error }, 'Ошибка загрузки сообщений');
    throw error;
  }
}

