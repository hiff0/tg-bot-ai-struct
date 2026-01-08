import { Context } from 'grammy';
import type { SessionFlavor } from 'grammy';
import type { ConversationFlavor } from '@grammyjs/conversations';

export interface SessionData {
    // Базовая структура сессии, можно расширить под нужды girl-bot
}

export type BaseContext = Context & SessionFlavor<SessionData>;
export type MyContext = ConversationFlavor<BaseContext>;

