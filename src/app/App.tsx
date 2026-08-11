import { useState } from 'react';
import type { GameMode } from '@/domain/round/round.types';
import { CreditsScreen } from '@/features/credits/CreditsScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { HomeScreen } from '@/features/home/HomeScreen';

type View = { name: 'home' } | { name: 'game'; mode: GameMode } | { name: 'credits' };

export function App() {
  const [view, setView] = useState<View>({ name: 'home' });

  if (view.name === 'game') {
    return <GameScreen mode={view.mode} onBackHome={() => setView({ name: 'home' })} />;
  }

  if (view.name === 'credits') {
    return <CreditsScreen onBack={() => setView({ name: 'home' })} />;
  }

  return (
    <HomeScreen
      onSelectMode={(mode) => setView({ name: 'game', mode })}
      onOpenCredits={() => setView({ name: 'credits' })}
    />
  );
}
