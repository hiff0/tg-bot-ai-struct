import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { env } from '@/config/env';
import logger from '@/lib/logger';

const model = new ChatOpenAI({
  modelName: env.GPT_MODEL,
  apiKey: env.OPENAI_API_KEY,
  temperature: 0.3,
  modelKwargs: {
    response_format: { type: "json_object" }
  },
});

export async function repairJson<T>(
  brokenJson: string, 
  parser: StructuredOutputParser<z.ZodType<T>>
): Promise<T> {
  const repairModel = new ChatOpenAI({
    modelName: env.GPT_MODEL,
    apiKey: env.OPENAI_API_KEY,
    temperature: 0,
    modelKwargs: {
      response_format: { type: "json_object" }
    },
  });

  const repairPrompt = `
Ты вернул JSON, который невалиден. Исправь его.
Требования:
- верни строго валидный JSON
- структура должна соответствовать схеме:

${parser.getFormatInstructions()}

Вот битый JSON:
${brokenJson}

Верни только JSON.
`;

  const fixed = await repairModel.invoke(repairPrompt);
  const content = typeof fixed.content === 'string' ? fixed.content : JSON.stringify(fixed.content);
  return parser.parse(content) as T;
}

export async function sendMessage<T>(
  schema: z.ZodType<T>,
  systemMessage: string, 
  userMessage: string,
  maxRetries: number = 2
): Promise<T> {
  const parser = StructuredOutputParser.fromZodSchema(schema);
  const chain = model.pipe(parser);

  const enhancedSystemMessage = `${systemMessage}

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К ФОРМАТУ ОТВЕТА:
1) Возвращай ТОЛЬКО валидный JSON без любого текста до или после
2) JSON должен строго соответствовать схеме ниже
3) НЕ добавляй символы переноса строк или пробелы перед JSON
4) Каждое текстовое поле должно быть корректной строкой без переносов внутри значения

Схема JSON:
${parser.getFormatInstructions()}`;

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await chain.invoke([
        { role: "system" as const, content: enhancedSystemMessage },
        { role: "user" as const, content: userMessage }
      ]);

      return result as T;
    } catch (error: any) {
      lastError = error;
      logger.warn(`[LLM] Попытка ${attempt + 1}/${maxRetries + 1} не удалась: ${error.message?.substring(0, 200)}`);
      
      // Если это последняя попытка, пробуем repair
      if (attempt === maxRetries) {
        try {
          logger.warn("[LLM] Запускаю auto-repair...");
          
          // Пытаемся извлечь хоть какой-то JSON из ошибки
          let brokenJson = '';
          if (error.message && error.message.includes('Text:')) {
            const textMatch = error.message.match(/Text:\s*(\{[\s\S]*)/);
            if (textMatch) {
              brokenJson = textMatch[1].trim();
            }
          }
          
          if (!brokenJson) {
            throw new Error('Не удалось извлечь JSON для восстановления');
          }
          
          return await repairJson(brokenJson, parser);
        } catch (repairError) {
          logger.error({ repairError }, "[LLM] Auto-repair не помог");
          throw lastError;
        }
      }
      
      // Ждем перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  // Этот код теоретически недостижим, но TypeScript требует return
  throw lastError || new Error('Неизвестная ошибка при обработке запроса');
}

