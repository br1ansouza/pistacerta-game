import type { VehicleIdentity } from '@/domain/vehicle/safe-vehicle';

type VehicleImageProps = {
  identity: VehicleIdentity;
};

export function VehicleImage({ identity }: VehicleImageProps) {
  if (!identity.image) {
    return (
      <div className="border-secondary bg-secondary text-quaternary flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-xs">
        sem imagem disponível
      </div>
    );
  }

  return (
    <img
      src={identity.image.src}
      alt={`${identity.brand} ${identity.model}`}
      loading="lazy"
      className="border-secondary aspect-video w-full rounded-xl border object-cover"
    />
  );
}
