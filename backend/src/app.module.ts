import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
// PrismaService'i sildik çünkü artık DatabaseService (pg) kullanıyoruz
import { AiService } from './ai.service';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService, 
    ChatGateway, 
    AiService, 
    DatabaseService // Yeni hafızamız burada
  ],
})
export class AppModule {}