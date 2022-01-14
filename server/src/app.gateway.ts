import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const aloneRoom = [];
const matchRoom = [];

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway {
  @WebSocketServer()
  server: Server;

  intervalId: NodeJS.Timer;

  @SubscribeMessage('join')
  startGame(client: Socket) {
    // 방 어떻게 만들지 생각해야 함
    console.log(aloneRoom);
    console.log(matchRoom);
    if (aloneRoom.length === 0) {
      aloneRoom.push(aloneRoom.length.toString());
      client.join(aloneRoom[0]);
      return `너 방(이름: ${aloneRoom[0]}) 입장함`;
    } else {
      client.join(aloneRoom[0]);
      matchRoom.push(aloneRoom[0]);
      aloneRoom.length = 0;
      this.server.in(matchRoom[0]).emit('areYouReady');
    }
  }

  @SubscribeMessage('imReady')
  handleMessage(
    client: Socket,
    payload: { edge: number; radius: number },
  ): any {
    const { edge, radius } = payload;

    let x = edge / 2;
    let y = edge / 2;
    let dx = 5;
    let dy = 5;

    // count 어떻게 할지 생각해야 함
    let count = 3;
    const intervalId = setInterval(() => {
      this.server.in(matchRoom[0]).emit('count', { count });
      count -= 1;
    }, 1000);
    setTimeout(() => {
      this.server.in(matchRoom[0]).emit('count', { count: 0 });
      clearInterval(intervalId);
      this.intervalId = setInterval(() => {
        client.emit('pos', { x: x, y: y });
        x += dx;
        y += dy;
        if (x + dx < radius || x + dx > edge - radius) dx *= -1;
        if (y + dy < radius || y + dy > edge - radius) dy *= -1;
      }, 10);
    }, 4000);
  }
}
