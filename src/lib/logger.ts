import pino from 'pino';
import { env } from '@/config/env';

// Устанавливаем временную зону для всего процесса
process.env.TZ = 'Europe/Moscow';

// Определяем уровень логирования на основе окружения
const level = env.NODE_ENV === 'production' ? 'info' : 'debug';

// Создаем логгер с конфигурацией
const logger = pino({
    level,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
            levelFirst: true,
        }
    } : undefined,
});

export default logger;

