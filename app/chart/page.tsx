import ChartPageClient from './ChartPageClient';

export default async function ChartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // 服务端读 searchParams,转成 URLSearchParams 字符串,传给 client
  const params = await searchParams;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') sp.set(k, v);
    else if (Array.isArray(v)) sp.set(k, v[0] ?? '');
  }
  const initialSearch = sp.toString();
  return <ChartPageClient initialSearch={initialSearch} />;
}
