import { z } from 'zod';

export const FUEL_TYPES = ['gasolina', 'etanol', 'flex', 'diesel', 'elétrico', 'híbrido'] as const;
export const ASPIRATION_TYPES = ['aspirado', 'turbo', 'compressor'] as const;
export const TRANSMISSION_TYPES = [
  'manual',
  'automático',
  'automatizado',
  'semiautomático',
  'cvt',
] as const;
export const DRIVETRAIN_TYPES = ['dianteira', 'traseira', 'integral'] as const;
export const BODY_TYPES = [
  'hatch',
  'sedã',
  'suv',
  'cupê',
  'conversível',
  'picape',
  'perua',
  'minivan',
] as const;
export const ORIGIN_TYPES = ['nacional', 'importado'] as const;
export const CYLINDER_LAYOUTS = ['em linha', 'V', 'boxer', 'W'] as const;
export const SPEC_SOURCES = [
  'webmotors',
  'icarros',
  'quatro-rodas',
  'fabricante',
  'fipe',
  'carros-na-web',
  'motonline',
  'moto-adventure',
  'moto-com-br',
  'motoo',
  'flatout',
  'o-carreteiro',
  'literatura-especializada',
  'concessionária',
] as const;
export const IMAGE_SOURCES = [
  'wikimedia',
  'flickr',
  'press-kit',
  'editorial',
  'classified',
  'pinterest',
  'placeholder',
] as const;
export const IMAGE_MARKETS = ['br', 'global'] as const;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const referenceMonthPattern = /^\d{4}-(?:0[1-9]|1[0-2])$/;

export const imageSchema = z.object({
  src: z.string().min(1),
  source: z.enum(IMAGE_SOURCES),
  market: z.enum(IMAGE_MARKETS),
  depicts: z.string().min(3),
  author: z.string().min(1).optional(),
  license: z.string().min(1).optional(),
  sourceUrl: z.url().optional(),
});

export const fipeSchema = z.object({
  value: z.number().positive(),
  referenceMonth: z.string().regex(referenceMonthPattern, 'Use o formato AAAA-MM.'),
  fipeCode: z.string().min(1).optional(),
});

export const measurementSchema = <const U extends string>(unit: U) =>
  z.object({
    value: z.number().positive(),
    unit: z.literal(unit),
  });

const vehicleBaseShape = {
  slug: z.string().regex(slugPattern, 'Use kebab-case: apenas minúsculas, números e hífens.'),
  brand: z.string().min(1),
  model: z.string().min(1),
  version: z.string().min(1).optional(),
  generation: z.string().min(1).optional(),
  story: z.string().min(1).max(240).optional(),
  year: z.number().int().min(1900).max(2100),
  origin: z.enum(ORIGIN_TYPES),
  countryOfOrigin: z.string().min(1).optional(),
  fipe: fipeSchema.nullable(),
  specSource: z.enum(SPEC_SOURCES),
  specSourceUrl: z.url().optional(),
  active: z.boolean(),
};

export const carSchema = z.object({
  ...vehicleBaseShape,
  kind: z.literal('car'),
  fuel: z.enum(FUEL_TYPES).optional(),
  displacement: z
    .string()
    .regex(/^\d+\.\d$/, 'Use o formato 1.0, 1.6, 2.0…')
    .optional(),
  power: measurementSchema('cv').optional(),
  torque: measurementSchema('kgfm').optional(),
  aspiration: z.enum(ASPIRATION_TYPES).optional(),
  transmission: z.enum(TRANSMISSION_TYPES).optional(),
  drivetrain: z.enum(DRIVETRAIN_TYPES).optional(),
  drivetrainSystem: z.string().min(1).optional(),
  bodyType: z.enum(BODY_TYPES).optional(),
  engineCode: z.string().min(1).optional(),
  engineFamily: z.string().min(1),
  cylinders: z.number().int().positive().optional(),
  cylinderLayout: z.enum(CYLINDER_LAYOUTS).optional(),
  valves: z.number().int().positive().optional(),
  doors: z.number().int().positive().optional(),
});

export const AXLE_CONFIGS = ['4x2', '4x4', '6x2', '6x4', '8x2', '8x4'] as const;
export const truckSchema = z.object({
  ...vehicleBaseShape,
  kind: z.literal('truck'),
  fuel: z.enum(FUEL_TYPES).optional(),
  displacement: z
    .string()
    .regex(/^\d+\.\d$/, 'Use o formato 12.8, 13.0…')
    .optional(),
  power: measurementSchema('cv').optional(),
  torque: z.object({ value: z.number().positive(), unit: z.enum(['kgfm', 'Nm']) }).optional(),
  aspiration: z.enum(ASPIRATION_TYPES).optional(),
  transmission: z.enum(TRANSMISSION_TYPES).optional(),
  axleConfigs: z.array(z.enum(AXLE_CONFIGS)).min(1).optional(),
  cabins: z.array(z.string().min(3)).min(1).optional(),
  gvwr: z.number().positive().optional(),
  gcwr: z.number().positive().optional(),
  engineCode: z.string().min(1).optional(),
  cylinders: z.number().int().positive().optional(),
  cylinderLayout: z.enum(CYLINDER_LAYOUTS).optional(),
  valves: z.number().int().positive().optional(),
});

export const MOTORCYCLE_STYLES = [
  'custom',
  'café racer',
  'big trail',
  'speed',
  'naked',
  'clássica',
  'trail',
  'urbana',
] as const;
export const ENGINE_CYCLES = ['2 tempos', '4 tempos'] as const;
export const COOLING_TYPES = ['ar', 'ar e óleo', 'ar e líquido', 'líquida'] as const;
export const FINAL_DRIVE_TYPES = ['corrente', 'correia', 'cardã'] as const;
export const WEIGHT_CONDITIONS = ['seco', 'ordem de marcha'] as const;

export const motorcycleSchema = z.object({
  ...vehicleBaseShape,
  kind: z.literal('motorcycle'),
  style: z.enum(MOTORCYCLE_STYLES),
  fuel: z.enum(FUEL_TYPES).optional(),
  displacement: measurementSchema('cm³'),
  power: measurementSchema('cv').optional(),
  torque: z.object({ value: z.number().positive(), unit: z.enum(['kgfm', 'Nm']) }).optional(),
  transmission: z.enum(TRANSMISSION_TYPES).optional(),
  finalDrive: z.enum(FINAL_DRIVE_TYPES).optional(),
  engineCycle: z.enum(ENGINE_CYCLES),
  cooling: z.enum(COOLING_TYPES).optional(),
  engineCode: z.string().min(1).optional(),
  cylinders: z.number().int().positive().optional(),
  cylinderLayout: z.enum(CYLINDER_LAYOUTS).optional(),
  valves: z.number().int().positive().optional(),
  weight: measurementSchema('kg').optional(),
  weightCondition: z.enum(WEIGHT_CONDITIONS).optional(),
  seatHeight: measurementSchema('mm').optional(),
  abs: z.boolean().optional(),
});

export const vehicleSchema = z.discriminatedUnion('kind', [
  carSchema,
  truckSchema,
  motorcycleSchema,
]);

export type Image = z.infer<typeof imageSchema>;
export type Fipe = z.infer<typeof fipeSchema>;
export const imageDictionarySchema = z.record(z.string(), imageSchema);

export type Car = z.infer<typeof carSchema> & { image: Image | null };
export type Truck = z.infer<typeof truckSchema> & { image: Image | null };
export type Motorcycle = z.infer<typeof motorcycleSchema> & { image: Image | null };
export type Vehicle = Car | Truck | Motorcycle;
export type VehicleKind = Vehicle['kind'];

export const IDENTITY_FIELDS = ['brand', 'model', 'generation', 'story', 'image'] as const;

export type IdentityField = (typeof IDENTITY_FIELDS)[number];
