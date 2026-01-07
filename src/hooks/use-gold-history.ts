import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGoldHistory() {
  // Refresh history every 5 minutes (it doesn't change as often as live price)
  const { data, error, isLoading } = useSWR('/api/market/history', fetcher, {
    refreshInterval: 1000 * 60 * 5,
  });

  return {
    history: data || [],
    isLoading,
    isError: error,
  };
}
