import * as PIXI from "pixi.js";
import { Socket } from "socket.io-client";

export class GameScene {
  private socket: Socket;
  private app: PIXI.Application;
  public ball: PIXI.Graphics;
  private radius: number;
  private lPaddle: PIXI.Graphics;
  private rPaddle: PIXI.Graphics;
  private isStart: boolean;

  constructor(edge: number, socket: Socket) {
    this.socket = socket;
    this.isStart = false;

    this.app = new PIXI.Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      backgroundColor: 0x000000,
      width: edge,
      height: edge,
      antialias: true,
    });

    const paddleX = (edge * 15) / 600;
    const paddleY = (edge * 120) / 600;

    // 왼쪽 패들
    this.lPaddle = new PIXI.Graphics();
    this.lPaddle.beginFill(0xff0000);
    this.lPaddle.drawRect(0, (edge - paddleY) / 2, paddleX, paddleY);
    this.lPaddle.endFill();

    // 오른쪽 패들
    this.rPaddle = new PIXI.Graphics();
    this.rPaddle.beginFill(0x0000ff);
    this.rPaddle.drawRect(
      edge - paddleX,
      (edge - paddleY) / 2,
      paddleX,
      paddleY
    );
    this.rPaddle.endFill();

    // 반지름: edge가 600일 때 10이 기준
    const radius = (edge * 10) / 600;
    this.radius = radius;
    this.ball = new PIXI.Graphics();
    this.ball.beginFill(0xffffff);
    this.ball.drawCircle(edge / 2, edge / 2, radius);
    this.ball.endFill();

    // app에 붙이기
    this.app.stage.addChild(this.ball);
    this.app.stage.addChild(this.lPaddle);
    this.app.stage.addChild(this.rPaddle);
  }

  gameStart() {}
  paddleDown() {}
  paddleUp() {}

  getRadius() {
    return this.radius;
  }

  setBallPos(x: number, y: number) {
    this.ball.x = x;
    this.ball.y = y;
  }
}