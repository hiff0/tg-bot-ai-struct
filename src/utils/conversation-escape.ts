import type { BaseContext } from '@/@types/MyContext';

/**
 * Список команд, которые должны прерывать conversation
 */
const ESCAPE_COMMANDS = [
  '/start',
  '/restart',
];

/**
 * Список текстовых hears паттернов, которые должны прерывать conversation
 */
const ESCAPE_HEARS: string[] = [];

/**
 * Проверяет, должен ли conversation быть прерван из-за команды или hears
 * @param ctx - контекст grammy
 * @returns true если нужно выйти из conversation
 */
export function shouldExitConversation(ctx: BaseContext): boolean {
  const messageText = ctx.message?.text;
  
  if (!messageText) {
    return false;
  }

  // Проверка команд
  if (ESCAPE_COMMANDS.some(cmd => messageText.startsWith(cmd))) {
    return true;
  }

  // Проверка hears
  if (ESCAPE_HEARS.includes(messageText)) {
    return true;
  }

  return false;
}

