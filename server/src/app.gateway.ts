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
  // 게임 관련 정보
  ball: {
    radius: number;
    x: number;
    y: number;
  };
  lPaddle: {
    width: number;
    height: number;
    y: number;
    oldYSpeed: number;
  };
  rPaddle: {
    width: number;
    height: number;
    y: number;
    oldYSpeed: number;
  };
  dx: number;
  dy: number;

  constructor() {
    this.dx = 2;
    this.dy = 0;
    this.ball = { radius: 10, x: 0, y: 0 };
    this.lPaddle = {
      width: 20,
      height: 120,
      y: 0,
      oldYSpeed: 0,
    };
    this.rPaddle = {
      width: 20,
      height: 120,
      y: 0,
      oldYSpeed: 0,
    };
  }

  @SubscribeMessage('join')
  startGame(client: Socket) {
    // 방 어떻게 만들지 생각해야 함
    if (aloneRoom.length === 0) {
      aloneRoom.push(aloneRoom.length.toString());
      client.join(aloneRoom[0]);
      client.emit('joined', { playerPos: 'left' });
    } else {
      client.join(aloneRoom[0]);
      matchRoom.push(aloneRoom[0]);
      aloneRoom.length = 0;
      client.emit('joined', { playerPos: 'right' });
      this.server.in(matchRoom[0]).emit('areYouReady');
    }
  }

  // 그냥 서버는 무조건 600 600 반지름 10인 공 기준으로 뿌림
  @SubscribeMessage('imReady')
  handleMessage(client: Socket): any {
    this.intervalId = setInterval(() => {
      client.emit('pos', {
        ball: this.ball,
        lPaddle: this.lPaddle,
        rPaddle: this.rPaddle,
      });
      this.updateBallVelocity();
      this.updateBallPos();
    }, 16);
  }

  updateBallPos() {
    this.ball.x += this.dx;
    this.ball.y += this.dy;
  }

  updateBallVelocity() {
    if (this.isCollidedWithPaddle()) {
      if (this.lPaddle.oldYSpeed === 1 || this.rPaddle.oldYSpeed === 1) {
        // 패들이 아래쪽으로 움직이는 중이라면
        this.dy += 1;
      } else if (
        this.lPaddle.oldYSpeed === -1 ||
        this.rPaddle.oldYSpeed === -1
      ) {
        // 패들이 위쪽으로 움직이는 중이라면
        this.dy -= 1;
      }
      // 패들에 부딪힐 때마다 가속
      this.dx *= -1.01;
    } else if (this.isCollidedWithWall()) {
      this.dy *= -1;
    }
  }

  isCollidedWithPaddle() {
    // 패들이랑 충돌해야할 위치에서
    // 공의 중심이 패들 사이에 있으면 this.dx *= -1;
    if (this.ball.x + this.dx > 270) {
      if (
        this.ball.y < this.rPaddle.y + this.rPaddle.height / 2 &&
        this.ball.y > this.rPaddle.y - this.rPaddle.height / 2
      ) {
        return true;
      }
    } else if (this.ball.x + this.dx < -270) {
      if (
        this.ball.y < this.lPaddle.y + this.lPaddle.height / 2 &&
        this.ball.y > this.lPaddle.y - this.lPaddle.height / 2
      ) {
        return true;
      }
    }
    return false;
  }

  isCollidedWithWall() {
    if (this.ball.y + this.dy < -290 || this.ball.y + this.dy > 290)
      return true;
  }

  @SubscribeMessage('upPaddle')
  upPaddle(_: Socket, payload: { playerIsLeft: boolean }): any {
    const { playerIsLeft } = payload;
    if (
      playerIsLeft === true &&
      this.lPaddle.y - this.lPaddle.height / 2 > -300
    ) {
      this.lPaddle.y -= 15;
      this.lPaddle.oldYSpeed = -1;
    } else if (
      playerIsLeft === false &&
      this.rPaddle.y - this.rPaddle.height / 2 > -300
    ) {
      this.rPaddle.y -= 15;
      this.rPaddle.oldYSpeed = -1;
    }
  }

  @SubscribeMessage('downPaddle')
  downPaddle(_: Socket, payload: { playerIsLeft: boolean }): any {
    const { playerIsLeft } = payload;
    if (
      playerIsLeft === true &&
      this.lPaddle.y + this.lPaddle.height / 2 < 300
    ) {
      this.lPaddle.y += 15;
      this.lPaddle.oldYSpeed = +1;
    } else if (
      playerIsLeft === false &&
      this.rPaddle.y + this.rPaddle.height / 2 < 300
    ) {
      this.rPaddle.y += 15;
      this.rPaddle.oldYSpeed = +1;
    }
  }

  @SubscribeMessage('keyUp')
  setPaddleSpeed(_: Socket, payload: { playerIsLeft: boolean }): any {
    const { playerIsLeft } = payload;
    if (playerIsLeft === true) {
      this.lPaddle.oldYSpeed = 0;
    } else if (playerIsLeft === false) {
      this.rPaddle.oldYSpeed = 0;
    }
  }
}
