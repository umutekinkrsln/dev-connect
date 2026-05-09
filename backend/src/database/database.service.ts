import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
  const isProduction = process.env.DATABASE_URL !== undefined;

  this.pool = new Pool(
    isProduction
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        }
      : {
          user: 'postgres',
          host: '127.0.0.1',
          database: 'devconnect_db',
          password: '12345', 
          port: 5433,
          ssl: false, 
        },
  );
}

  async onModuleInit() {
    try {
      await this.pool.connect();
      console.log('🚀 Veritabanına başarıyla bağlandık reis!');
    } catch (err) {
      console.error('❌ Bağlantı patladı:', err);
    }
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}