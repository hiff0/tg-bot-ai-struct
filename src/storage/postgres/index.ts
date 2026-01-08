import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';
import logger from '@/lib/logger';

export class PostgresStorage {
  private client: PrismaClient;
  private isReady: boolean = false;

  constructor() {
    this.client = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async connect(): Promise<void> {
    if (this.isReady) {
      logger.info('Postgres уже подключен');
      return;
    }

    try {
      await this.client.$connect();
      this.isReady = true;
      logger.info('Postgres подключен');
    } catch (error) {
      logger.error({ error }, 'Ошибка Postgres');
      throw error;
    }
  }

  getInstance(): PrismaClient {
    return this.client;
  }

  async getPromptFromName(name: string): Promise<string | null> {
    try {
      const prompt = await this.client.prompt.findUnique({
          where: { name },
        });
      return prompt?.text || null;
    } catch (error) {
      logger.error({ name, error }, 'Ошибка при получении промпта');
      return null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      logger.info('Postgres отключен');
    } catch (error) {
      logger.error({ error }, 'Ошибка при отключении Postgres');
      throw error;
    }
  }
}

export const postgresStorage = new PostgresStorage();

