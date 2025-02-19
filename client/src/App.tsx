import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import socket from "./socket";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
    });
    socket.on("disconnect", () => {
      console.log("disconnected from server");
    });
    socket.on("test-emit", (data) => {
      console.log("client:", data);
    });

    return () => {
      socket.off("connect", () => {});

      socket.off("disconnect", () => {
        console.log("disconnected from server");
      });

      socket.off("test-emit", (data) => {
        console.log("client:", data);
      });
    };
  }, []);

  return (
    <>
      <div>
        <input onChange={(e) => socket.emit("test-emit", e.target.value)} />
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
