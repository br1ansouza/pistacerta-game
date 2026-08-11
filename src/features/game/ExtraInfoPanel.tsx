import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { SafeVehicle } from '@/domain/vehicle/safe-vehicle';

type ExtraInfoPanelProps = {
  vehicle: SafeVehicle;
};

function buildEntries(vehicle: SafeVehicle): { label: string; value: string }[] {
  const entries: { label: string; value: string }[] = [];

  if (vehicle.cylinders !== undefined) {
    entries.push({ label: 'Cilindros', value: String(vehicle.cylinders) });
  }

  if (vehicle.doors !== undefined) {
    entries.push({ label: 'Portas', value: String(vehicle.doors) });
  }

  if (vehicle.countryOfOrigin !== undefined) {
    entries.push({ label: 'País de origem', value: vehicle.countryOfOrigin });
  }

  return entries;
}

export function ExtraInfoPanel({ vehicle }: ExtraInfoPanelProps) {
  const [open, setOpen] = useState(false);
  const entries = buildEntries(vehicle);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-chalk-500 hover:text-flame-400 focus-visible:outline-flame-500 self-center py-1 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {open ? 'Ocultar informações' : 'Mais informações'}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.dl
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className="border-ink-700 bg-ink-900 grid grid-cols-2 gap-3 overflow-hidden border-2 p-3"
          >
            {entries.map((entry) => (
              <div key={entry.label} className="flex flex-col gap-0.5">
                <dt className="text-chalk-500 font-display text-[0.65rem] tracking-wider uppercase">
                  {entry.label}
                </dt>
                <dd className="text-chalk-100 text-sm font-bold tabular-nums">{entry.value}</dd>
              </div>
            ))}
          </motion.dl>
        )}
      </AnimatePresence>
    </div>
  );
}
