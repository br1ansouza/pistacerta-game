import { useState } from 'react';
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
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-brand-secondary focus-visible:outline-brand self-start text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {open ? 'Ocultar informações' : 'Mais informações'}
      </button>

      {open && (
        <dl className="border-secondary bg-secondary flex flex-col rounded-xl border px-4 py-2">
          {entries.map((entry) => (
            <div key={entry.label} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-tertiary text-sm">{entry.label}</dt>
              <dd className="text-primary text-sm font-semibold tabular-nums">{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
