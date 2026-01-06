import useSWR from 'swr';

// The "Fetcher" function (wraps the native fetch)
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGoldPrice() {
  const { data, error, isLoading } = useSWR('/api/market/live', fetcher, {
    refreshInterval: 60000, // Poll every 60 seconds
    revalidateOnFocus: true, // Refresh when user clicks the window
  });

  return {
    price: data?.price,
    change: data?.change_24h,
    isLoading,
    isError: error,
  };
}
