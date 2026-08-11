import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { GameMode } from '@/domain/round/round.types';
import { CreditsScreen } from '@/features/credits/CreditsScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { HomeScreen } from '@/features/home/HomeScreen';

type View = { name: 'home' } | { name: 'game'; mode: GameMode } | { name: 'credits' };

const transition = { duration: 0.24, ease: [0.4, 0, 0.2, 1] as const };

export function App() {
  const [view, setView] = useState<View>({ name: 'home' });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view.name === 'game' ? `game-${view.mode}` : view.name}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={transition}
      >
        {view.name === 'home' && (
          <HomeScreen
            onSelectMode={(mode) => setView({ name: 'game', mode })}
            onOpenCredits={() => setView({ name: 'credits' })}
          />
        )}

        {view.name === 'game' && (
          <GameScreen mode={view.mode} onBackHome={() => setView({ name: 'home' })} />
        )}

        {view.name === 'credits' && <CreditsScreen onBack={() => setView({ name: 'home' })} />}
      </motion.div>
    </AnimatePresence>
  );
}
