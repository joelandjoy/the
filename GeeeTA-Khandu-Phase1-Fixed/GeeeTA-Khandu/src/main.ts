import './style.css';
import { Game } from './game/Game';

const loading = document.querySelector<HTMLElement>('#loading');
const errorOverlay = document.querySelector<HTMLElement>('#error');
const errorMessage = document.querySelector<HTMLElement>('#error-message');
const canvas = document.querySelector<HTMLCanvasElement>('#game');

async function startGame(): Promise<void> {
  try {
    if (!canvas) {
      throw new Error('Game canvas could not be found.');
    }

    const game = new Game(canvas);
    await game.init();

    loading?.classList.add('hidden');
    game.start();
  } catch (error) {
    console.error('Failed to start GeeeTA Khandu:', error);
    loading?.classList.add('hidden');
    errorOverlay?.classList.remove('hidden');

    if (errorMessage) {
      errorMessage.textContent = error instanceof Error
        ? error.message
        : 'Unknown startup error.';
    }
  }
}

void startGame();
