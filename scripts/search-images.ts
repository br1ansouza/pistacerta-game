import process from 'node:process';

const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PistaCerta/0.1 (https://github.com/br1ansouza/pistacerta-game)';

type SearchResponse = {
  query?: { search?: { title: string }[] };
};

async function commons<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(API);
  url.search = new URLSearchParams({ ...params, format: 'json', origin: '*' }).toString();

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

  if (!response.ok) {
    throw new Error(`Commons respondeu ${response.status}`);
  }

  return (await response.json()) as T;
}

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.error('uso: bun run scripts/search-images.ts <termos de busca>');
  process.exit(1);
}

const result = await commons<SearchResponse>({
  action: 'query',
  list: 'search',
  srsearch: `${query} filetype:bitmap`,
  srnamespace: '6',
  srlimit: '10',
});

for (const item of result.query?.search ?? []) {
  console.log(item.title);
}
