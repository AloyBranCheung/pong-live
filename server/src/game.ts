import { Socket } from "socket.io";

interface Player {
  id: string;
  y: number;
  x: number;
  score: number;
  ready: boolean;
}

export interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
  players: Map<string, Player>;
  gameStarted: boolean;
  lastUpdate: number;
}

class PongGame {
  // all in pixels
  private readonly CANVAS_WIDTH = 1700;
  private readonly CANVAS_HEIGHT = 800;
  private readonly PADDLE_HEIGHT = 129;
  private readonly PADDLE_WIDTH = 15;
  private readonly BALL_SIZE = 15;
  private readonly BALL_SPEED = 400; // pixels per second

  private state: GameState;
  private tickRate: number = 1000 / 60; // 60 FPS
  private gameLoop: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      ball: {
        x: this.CANVAS_HEIGHT / 2,
        y: this.CANVAS_WIDTH / 2,
        dx: this.BALL_SPEED,
        dy: this.BALL_SPEED,
      },
      players: new Map(),
      gameStarted: false,
      lastUpdate: performance.now(),
    };
  }

  addPlayer(socket: Socket): boolean {
    if (this.state.players.size >= 2) return false;

    // starting x position based on if player 1 or 2
    const isFirstPlayer = this.state.players.size === 0;
    const x = isFirstPlayer ? 25 : this.CANVAS_WIDTH - 25;

    // add player
    const player: Player = {
      id: socket.id,
      y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      score: 0,
      ready: false,
      x,
    };
    this.state.players.set(socket.id, player);

    return true;
  }

  // playerId is the socket.id
  removePlayer(playerId: string): void {
    this.state.players.delete(playerId);

    if (this.state.players.size < 2) {
      this.stopGame();
    }
  }

  // playerId is the socket.id
  setPlayerReady(playerId: string): void {
    const player = this.state.players.get(playerId);
    if (player) {
      player.ready = true;

      // Check if all players are ready
      let allReady = true;
      this.state.players.forEach((p) => {
        if (!p.ready) allReady = false;
      });

      if (allReady && this.state.players.size === 2) {
        this.startGame();
      }
    }
  }

  // where playerId is socket.id
  movePlayer(playerId: string, direction: "up" | "down"): void {
    const player = this.state.players.get(playerId);
    if (!player || !this.state.gameStarted) return;

    if (direction === "up" && player.y > 0) {
      player.y -= 5;
    } else if (
      direction === "down" &&
      player.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT
    ) {
      player.y += 5;
    }
  }

  private startGame(): void {
    this.state.gameStarted = true;

    this.gameLoop = setInterval(() => this.update(), this.tickRate);
  }

  private update(): void {
    this.updateBall();
    this.state.lastUpdate = performance.now();
  }

  private updateBall(): void {
    const deltaTime = (performance.now() - this.state.lastUpdate) / 1000;
    const ball = this.state.ball;

    // Update ball position
    ball.x += ball.dx * deltaTime;
    ball.y += ball.dy * deltaTime;

    // Wall collisions (top and bottom)
    if (ball.y <= 0 || ball.y >= this.CANVAS_HEIGHT - this.BALL_SIZE) {
      ball.dy = -ball.dy;
    }

    // Paddle collisions
    this.state.players.forEach((player, id) => {
      const isLeftPaddle = Array.from(this.state.players.keys())[0] === id;
      const paddleX = isLeftPaddle ? 25 : this.CANVAS_WIDTH - 25;

      if (this.checkCollision(ball, paddleX, player.y)) {
        ball.dx = -ball.dx;
        // Add some randomness to the ball's vertical direction
        ball.dy = ball.dy + (Math.random() - 0.5) * 100;
      }
    });

    // Scoring
    if (ball.x <= 0) {
      // Player 2 scores
      const player2 = Array.from(this.state.players.values())[1];
      player2.score++;
      this.resetBall();
    } else if (ball.x >= this.CANVAS_WIDTH) {
      // Player 1 scores
      const player1 = Array.from(this.state.players.values())[0];
      player1.score++;
      this.resetBall();
    }
  }

  private resetBall(): void {
    this.state.ball = {
      x: this.CANVAS_WIDTH / 2,
      y: this.CANVAS_HEIGHT / 2,
      dx: Math.random() > 0.5 ? this.BALL_SPEED : -this.BALL_SPEED,
      dy: (Math.random() - 0.5) * this.BALL_SPEED,
    };
  }

  private checkCollision(
    ball: GameState["ball"],
    paddleX: number,
    paddleY: number
  ): boolean {
    return (
      ball.x < paddleX + this.PADDLE_WIDTH &&
      ball.x + this.BALL_SIZE > paddleX &&
      ball.y < paddleY + this.PADDLE_HEIGHT &&
      ball.y + this.BALL_SIZE > paddleY
    );
  }

  private stopGame(): void {
    this.state.gameStarted = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  getStateForClient() {
    const clientState = {
      ...this.state,
      players: Array.from(this.state.players.entries()),
    };

    return clientState;
  }
}

export default PongGame;

/* 
class PongGame {
    private playerIntervals: Map<string, NodeJS.Timeout> = new Map();

    addPlayer(socket: Socket): boolean {
        // ... other player setup code ...

        // If you need per-player intervals, track them properly
        this.playerIntervals.set(socket.id, setInterval(() => {
            // player-specific updates
        }, 1000 / 60));

        return true;
    }

    removePlayer(playerId: string): void {
        // Clean up any player-specific intervals
        const interval = this.playerIntervals.get(playerId);
        if (interval) {
            clearInterval(interval);
            this.playerIntervals.delete(playerId);
        }
        // ... other cleanup code ...
    }
}

*/
