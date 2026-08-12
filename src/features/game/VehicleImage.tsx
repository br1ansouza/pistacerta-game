import type { VehicleIdentity } from '@/domain/vehicle/safe-vehicle';
import { asset } from '@/lib/asset';

type VehicleImageProps = {
  identity: VehicleIdentity;
};

export function VehicleImage({ identity }: VehicleImageProps) {
  if (!identity.image) {
    return (
      <div className="border-ink-700 from-ink-900 to-ink-850 shadow-hard relative flex aspect-video w-full flex-col items-center justify-center gap-2 overflow-hidden border-2 bg-gradient-to-b">
        <div className="from-flame-600/10 absolute inset-0 bg-gradient-to-t to-transparent" />
        <img
          src={asset('car.gif')}
          alt=""
          aria-hidden
          className="pixelated relative h-20 w-20 opacity-25"
        />
        <p className="text-chalk-500 relative text-[0.7rem]">sem foto para este</p>
      </div>
    );
  }

  return (
    <div className="border-ink-700 bg-ink-900 shadow-hard relative overflow-hidden border-2">
      <img
        src={identity.image.src.startsWith('http') ? identity.image.src : asset(identity.image.src)}
        alt={`${identity.brand} ${identity.model}`}
        loading="lazy"
        className="aspect-video w-full object-cover"
      />
      <div className="from-ink-950/50 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
    </div>
  );
}
