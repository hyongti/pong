import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import styled from "styled-components";

function Game() {
  const [socket] = useState<Socket>(io("http://localhost:8000"));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // 들어와서 입장했다는 메시지 보냄
    socket.emit("join", (msg: string) => console.log(msg));

    // 서버에 보낼 내 캔버스 크기
    const radius = 7;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const edge: number = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = edge;
    canvas.height = edge;

    socket.on("areYouReady", () => {
      socket.emit("imReady", {
        edge,
        radius,
      });
    });

    socket.on("count", (payload) => {
      setCount(payload.count);
    });
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (x: number, y: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2, false);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    };

    socket.on("pos", (pos) => draw(pos.x, pos.y));
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "yellow",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Div>{count === null ? "대기 중" : count}</Div>
      <canvas ref={canvasRef} style={{ background: "black" }}></canvas>
    </div>
  );
}

export default Game;

const Div = styled.div`
  display: flex;
  justify-content: center;
  background-color: green;
  color: white;
  width: 100px;
  position: absolute;
  top: 0;
`;
