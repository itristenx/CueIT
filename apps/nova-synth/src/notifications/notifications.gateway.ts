import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    // Optionally authenticate client
    // console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    // console.log('Client disconnected:', client.id);
  }

  sendNotification(userId: string, payload: any) {
    // Emit to a specific user room
    this.server.to(userId).emit('notification', payload);
  }
}
