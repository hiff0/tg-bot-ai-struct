import { config } from 'dotenv';
import { cleanEnv, str, num } from 'envalid';

config();

export const env = cleanEnv(process.env, {
  // Bot
  BOT_TOKEN: str({ desc: 'Telegram Bot Token' }),
  BOT_PAYMENT_TOKEN: str({ default: '', desc: 'Telegram Payment Token' }),
  BOT_URL: str({ desc: 'Telegram Bot URL' }),
  SUPPORT_URL: str({ desc: 'Support URL' }),

  HASH_SALT: str({ desc: 'Hash salt' }),
  
  // Environment
  NODE_ENV: str({ 
    choices: ['development', 'production', 'test'], 
    default: 'development',
    desc: 'Node environment' 
  }),
  ADMIN_ID: str({ default: undefined, desc: 'Admin Telegram ID' }),
  
  // Database
  REDIS_URL: str({ desc: 'Redis connection URL' }),
  REDIS_KEY_TTL: num({ desc: 'Redis TTL' }),
  DATABASE_URL: str({ desc: 'PostgreSQL database URL' }),
  
  // OpenAI
  OPENAI_API_KEY: str({ desc: 'OpenAI API Key' }),
  GPT_MODEL: str({ default: 'gpt-4o-mini', desc: 'GPT Model' }),
  
  // Documents
  OFERTA_URL: str({ desc: 'Oferta document URL' }),
  PRIVACY_POLICY: str({ desc: 'Privacy policy URL' }),
});

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';

