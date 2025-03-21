import { useState, useEffect } from "react";
// types
import { GameState } from "../../server/src/game";
//
import socket from "./socket";
import styles from "./App.module.css";
import Board from "./components/Board";

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("gameState", (state: GameState) => {
      const currState = {
        ...state,
        players: new Map(state.players),
      };
      setGameState(currState);

      currState.players.forEach((player) => {
        if (player.id === socket.id) {
          setIsReady(player.ready);
        }
      });
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameState");
    };
  }, []);

  return (
    <div className={styles.appContainer}>
      {isConnected && <p>You are now connected.</p>}
      <ul>
        {gameState &&
          Array.from(gameState.players.values()).map((val) => (
            <li key={val.id}>
              Player {val.id} is {val.ready ? "ready" : "not ready"}
            </li>
          ))}
      </ul>

      {!isReady && (
        <button onClick={() => socket.emit("playerReady")}>ready</button>
      )}
      {gameState && socket && <Board gameState={gameState} />}
    </div>
  );
}

export default App;
