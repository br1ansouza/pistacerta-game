const BASE = process.env.PUBLIC_BASE ?? '/';

export function asset(path: string): string {
  return `${BASE}${path.replace(/^\//, '')}`;
}
