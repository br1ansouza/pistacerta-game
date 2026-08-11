import { useState } from 'react';
import type { GameMode } from '@/domain/round/round.types';
import { GameScreen } from '@/features/game/GameScreen';
import { HomeScreen } from '@/features/home/HomeScreen';

export function App() {
  const [mode, setMode] = useState<GameMode | null>(null);

  if (!mode) {
    return <HomeScreen onSelectMode={setMode} />;
  }

  return <GameScreen mode={mode} onBackHome={() => setMode(null)} />;
}
