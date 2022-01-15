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
    if (aloneRoom.length === 0) {
      aloneRoom.push(aloneRoom.length.toString());
      client.join(aloneRoom[0]);
      client.emit('joined', `방(이름: ${aloneRoom[0]}) 입장함`);
    } else {
      client.join(aloneRoom[0]);
      matchRoom.push(aloneRoom[0]);
      aloneRoom.length = 0;
      client.emit('joined', `방(이름: ${matchRoom[0]}) 입장함`);
      this.server.in(matchRoom[0]).emit('areYouReady');
    }
  }

  @SubscribeMessage('imReady')
  handleMessage(
    client: Socket,
    payload: { edge: number; radius: number },
  ): any {
    const { edge, radius } = payload;

    let x = 0;
    let y = 0;
    let dx = (edge * 6) / 600;
    let dy = (edge * 6) / 600;

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
        // 캔버스 중간이 (0,0) 오른쪽이 +x, 위쪽이 +y, 흔히 생각하는 좌표계
        if (x + dx < -edge / 2 + radius || x + dx > edge / 2 - radius) dx *= -1;
        if (y + dy < -edge / 2 + radius || y + dy > edge / 2 - radius) dy *= -1;
      }, 16);
    }, 4000);
  }
}
