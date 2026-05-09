import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../database/database.service'; // Yolu kontrol et, database klasöründeyse böyle kalmalı
import { AiService } from '../ai.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private db: DatabaseService, 
    private aiService: AiService
  ) {}

  @SubscribeMessage('request_previous_messages')
  async handleRequestPreviousMessages(@ConnectedSocket() client: Socket) {
    const result = await this.db.query(
      'SELECT content, role as username, "createdAt" FROM messages ORDER BY "createdAt" ASC LIMIT 50'
    );
    client.emit('previous_messages', result.rows);
  }

  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() data: { username: string; content: string }) {
    // 1. Kullanıcı mesajını kaydet
    const userResult = await this.db.query(
      'INSERT INTO messages (content, role) VALUES ($1, $2) RETURNING *',
      [data.content, data.username]
    );
    
    const savedMessage = {
      username: userResult.rows[0].role,
      content: userResult.rows[0].content,
      createdAt: userResult.rows[0].createdAt
    };

    this.server.emit('receive_message', savedMessage);

    if (data.username !== 'DevBot') {
      const botReply = await this.aiService.getBotResponse(data.content);
      
      const botResult = await this.db.query(
        'INSERT INTO messages (content, role) VALUES ($1, $2) RETURNING *',
        [botReply, 'DevBot']
      );

      const savedBotMessage = {
        username: botResult.rows[0].role,
        content: botResult.rows[0].content,
        createdAt: botResult.rows[0].createdAt
      };
      
      this.server.emit('receive_message', savedBotMessage);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { username: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('user_typing', data);
  }
}