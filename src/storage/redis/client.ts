import { Redis } from 'ioredis';
import crypto from 'crypto';
import { env } from '@/config/env';

const ALGORITHM = 'aes-256-gcm';

export default class RedisWrapper extends Redis {
    private key = crypto.scryptSync(env.HASH_SALT, 'salt', 32);

    encrypt(text: string): string {
        if (!text) return text;
            
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        
        // iv:encrypted:tag
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    };
    
    decrypt(encryptedText: string): string {
        if (!encryptedText || encryptedText.split(':').length !== 3) {
            return encryptedText;
        }
        
        const [ivHex, encrypted, tagHex] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };

    async set(key: string, value: any, ...args: any[]): Promise<'OK'> {
        const serialized = this.encrypt(value);
        return super.set(key, serialized, ...args);
    }
    
    async get(key: string): Promise<string | null> {
        const raw = await super.get(key);
        return raw ? this.decrypt(raw) : null;
    }
}

