import styles from "./App.module.css";
import Board from "./components/Board";

function App() {
  return (
    <div className={styles.appContainer}>
      <Board />
    </div>
  );
}

export default App;
