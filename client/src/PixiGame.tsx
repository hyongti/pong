import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import styled from "styled-components";
import { GameScene } from "./GameScene";

function PixiGame(): JSX.Element {
  const [count, setCount] = useState<number | null>(null);
  const [socket] = useState<Socket>(io("http://localhost:8000"));

  useEffect(() => {
    const edge: number = Math.min(window.innerWidth, window.innerHeight);

    // 로직 상 이상하지만.. 게임 씬을 만들고 입장 요청을 보냄.
    const gameScene = new GameScene(edge, socket);

    // 게임 방에 입장 요청
    socket.emit("join");
    // 게임 방에 입장 후 메시지 출력
    socket.on("joined", console.log);

    // 내 정보 보냄
    socket.on("areYouReady", () => {
      socket.emit("imReady", {
        edge,
        radius: gameScene.getRadius(),
      });
    });
    // 카운트 다운
    socket.on("count", (payload) => {
      setCount(payload.count);
    });

    // 공 포지션
    socket.on("pos", (pos) => {
      console.log(pos);
      gameScene.setBallPos(pos.x, pos.y);
    });

    // 키보드 입력
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        console.log("위 화살표 눌림");
      } else if (e.key === "ArrowUp") {
        console.log("아래 화살표 눌림");
      }
    });
  }, []);
  return (
    <BackgroundDiv>
      <CountDiv>{count === null ? "대기 중" : count}</CountDiv>
      <canvas id="pixi-canvas" />
    </BackgroundDiv>
  );
}

export default PixiGame;

const BackgroundDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: yellow;
  width: 100vw;
  height: 100vh;
`;

const CountDiv = styled.div`
  display: flex;
  justify-content: center;
  background-color: green;
  color: white;
  width: 100px;
  position: absolute;
  top: 0;
`;
