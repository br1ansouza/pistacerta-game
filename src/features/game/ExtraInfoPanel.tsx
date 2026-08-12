import type { SafeVehicle } from '@/domain/vehicle/safe-vehicle';

type ExtraInfoPanelProps = {
  vehicle: SafeVehicle;
};

function buildEntries(vehicle: SafeVehicle): { label: string; value: string }[] {
  const entries: { label: string; value: string }[] = [];

  if (vehicle.countryOfOrigin !== undefined) {
    entries.push({ label: 'País de origem', value: vehicle.countryOfOrigin });
  }

  return entries;
}

export function ExtraInfoPanel({ vehicle }: ExtraInfoPanelProps) {
  const entries = buildEntries(vehicle);

  if (entries.length === 0) {
    return null;
  }

  return (
    <dl className="border-ink-800 grid grid-cols-2 gap-3 border-t pt-3">
      {entries.map((entry) => (
        <div key={entry.label} className="flex flex-col gap-0.5">
          <dt className="text-chalk-500 font-display text-[0.65rem] tracking-wider uppercase">
            {entry.label}
          </dt>
          <dd className="text-chalk-100 text-sm font-bold tabular-nums">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}
