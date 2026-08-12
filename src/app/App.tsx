import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import type { GameMode } from '@/domain/round/round.types';
import type { VehicleKind } from '@/domain/vehicle/vehicle.schema';
import { CreditsScreen } from '@/features/credits/CreditsScreen';
import { GameScreen } from '@/features/game/GameScreen';
import { HomeScreen } from '@/features/home/HomeScreen';

type View = { name: 'home' } | { name: 'game'; mode: GameMode } | { name: 'credits' };

const transition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

export function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const [kind, setKind] = useState<VehicleKind>('car');

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view.name === 'game' ? `game-${view.mode}-${kind}` : view.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          {view.name === 'home' && (
            <HomeScreen
              kind={kind}
              onSelectKind={setKind}
              onSelectMode={(mode) => setView({ name: 'game', mode })}
              onOpenCredits={() => setView({ name: 'credits' })}
            />
          )}

          {view.name === 'game' && (
            <GameScreen mode={view.mode} kind={kind} onBackHome={() => setView({ name: 'home' })} />
          )}

          {view.name === 'credits' && <CreditsScreen onBack={() => setView({ name: 'home' })} />}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
