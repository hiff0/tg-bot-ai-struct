import { Bot, session } from 'grammy';
import { env } from '@/config/env';
import { errorHandler } from '@/middlewares';
import crypto from 'crypto';
import type { MyContext, BaseContext } from './@types/MyContext';
import { redisStorage } from '@/storage/redis';
import { RedisAdapter } from '@grammyjs/storage-redis';
import {
  type ConversationFlavor,
  conversations,
} from "@grammyjs/conversations";
import { Context } from 'grammy';
import { shouldExitConversation } from '@/utils/conversation-escape';
import logger from '@/lib/logger';

export function createBot() {
  const storage = new RedisAdapter({ instance: redisStorage.getInstance(), ttl: env.REDIS_KEY_TTL, autoParseDates: true });

  const bot = new Bot<ConversationFlavor<MyContext>>(env.BOT_TOKEN);

  bot.use(session({
    storage,
    initial: () => ({}),
    getSessionKey: (ctx) => 
      ctx.chat?.id ?
      `session:${crypto.createHash('sha256').update(ctx.chat.id + env.HASH_SALT).digest('hex')}` : 
      undefined
  }));

  bot.use(conversations());
  
  // Middleware для выхода из conversation при вводе команды или hears
  bot.use(async (ctx, next) => {
    if (shouldExitConversation(ctx)) {
      // Можно добавить выход из конкретных conversations при необходимости
    }
    await next();
  });
  
  // Базовые команды
  bot.command('start', async (ctx: Context) => {
    await ctx.reply('Привет! Это girl-bot.');
  });

  bot.command('restart', async (ctx: Context) => {
    await ctx.reply('Бот перезапущен.');
  });

  bot.catch(errorHandler);

  // Обработка успешной оплаты
  bot.on('pre_checkout_query', async (ctx: MyContext) => {
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on('message:successful_payment', async (ctx: MyContext) => {
    logger.info(`successful_payment, userId: ${ctx.from?.id}`);
    // Обработка успешной оплаты
  });

  return { bot, storage };
}

