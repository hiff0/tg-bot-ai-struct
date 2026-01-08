import { env } from '@/config/env';
import logger from '@/lib/logger';
import RedisWrapper from '@/storage/redis/client';

const CACHE_KEY = 'girl-bot';

export class RedisStorage {
  private client: RedisWrapper;
  private isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor() {
    this.client = new RedisWrapper(env.REDIS_URL);

    this.client.on('connect', () => {
      logger.info('Redis подключен');
    });

    this.client.on('error', (error) => {
      logger.error({ error }, 'Ошибка Redis');
    });

    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.client.once('ready', () => {
        this.isReady = true;
        resolve();
      });
      this.client.once('error', (error) => reject(error));
    });
  }

  async connect(): Promise<void> {
    if (this.isReady) {
      logger.info('Redis уже подключен');
      return;
    }
    await this.readyPromise;
  }

  getInstance(): RedisWrapper {
    return this.client;
  }

  async getMessage(key: string, lang: string = 'ru'): Promise<string | null> {
    try {
      const fullKey = `${CACHE_KEY}:messages:${lang}:${key}`;
      const message = await this.client.get(fullKey);
      
      if (!message) {
        logger.warn(`Сообщение не найдено: ${fullKey}`);
      }

      return message;
    } catch (error) {
      logger.error({ key, error }, 'Ошибка при получении сообщения');
      return null;
    }
  }

  async setMessage(key: string, value: string, lang: string = 'ru'): Promise<void> {
    try {
      const fullKey = `${CACHE_KEY}:messages:${lang}:${key}`;
      await this.client.set(fullKey, value);
      logger.info(`Сообщение сохранено: ${fullKey}`);
    } catch (error) {
      logger.error({ key, error }, 'Ошибка при сохранении сообщения');
    }
  }

  async getKeyboardMessage(key: string, lang: string = 'ru'): Promise<string | null> {
    try {
      const fullKey = `${CACHE_KEY}:keyboard_messages:${lang}:${key}`;
      const message = await this.client.get(fullKey);
      
      if (!message) {
        logger.warn(`Сообщение клавиатуры не найдено: ${fullKey}`);
      }

      return message;
    } catch (error) {
      logger.error({ key, error }, 'Ошибка при получении сообщения клавиатуры');
      return null;
    }
  }

  async setKeyboardMessage(key: string, value: string, lang: string = 'ru'): Promise<void> {
    try {
      const fullKey = `${CACHE_KEY}:keyboard_messages:${lang}:${key}`;
      await this.client.set(fullKey, value);
      logger.info(`Сообщение клавиатуры сохранено: ${fullKey}`);
    } catch (error) {
      logger.error({ key, error }, 'Ошибка при сохранении сообщения клавиатуры');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Redis отключен');
    } catch (error) {
      logger.error({ error }, 'Ошибка при отключении Redis');
      throw error;
    }
  }
}

export const redisStorage = new RedisStorage();

