import React, { useState } from "react";
// import Game from "./Game";
import PixiGame from "./PixiGame";

function App() {
  const [isClick, setIsClick] = useState(false);
  const handleClick = () => {
    setIsClick(!isClick);
  };
  return (
    <>
      <button
        style={{ position: "absolute", top: "0", left: "0" }}
        onClick={handleClick}
      >
        게임 시작
      </button>
      {/* {isClick && <Game />} */}
      {isClick && <PixiGame />}
    </>
  );
}

export default App;
