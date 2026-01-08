import type { BaseContext } from "../@types/MyContext";
import { InlineKeyboard } from 'grammy';

export const answerAndReply = async (ctx: BaseContext) => {
  try {
    await ctx.answerCallbackQuery();
  } catch (err) {}
  try {
    const emptyKeyboard = new InlineKeyboard();
    await ctx.editMessageReplyMarkup({ reply_markup: emptyKeyboard });
  } catch (err) {}
}

