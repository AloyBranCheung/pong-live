import { useEffect, useState } from "react";
import { GameState } from "../../../server/src/game";
import styles from "./Board.module.css";
import socket from "../socket";

interface BoardProps {
  gameState: GameState;
}

export default function Board({ gameState }: BoardProps) {
  const playersArr = Array.from(gameState.players.values());

  useEffect(() => {
    const keys: { [key: string]: boolean } = {};

    window.addEventListener("keydown", (e) => {
      keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });

    const interval = setInterval(() => {
      if (keys["ArrowUp"]) {
        socket.emit("playerMove", "up");
      }
      if (keys["ArrowDown"]) {
        socket.emit("playerMove", "down");
      }
    }, 1000 / 60);

    return () => {
      window.removeEventListener("keydown", (e) => {
        keys[e.key] = true;
      });

      window.removeEventListener("keyup", (e) => {
        keys[e.key] = false;
      });

      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.board}>
      {playersArr.map((player) => (
        <div
          key={player.id}
          style={{
            position: "absolute",
            backgroundColor: "black",
            height: 129,
            width: 15,
            left: player.x,
            top: player.y,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          backgroundColor: "black",
          height: 15,
          width: 15,
          left: gameState.ball.x,
          top: gameState.ball.y,
        }}
      />
    </div>
  );
}
