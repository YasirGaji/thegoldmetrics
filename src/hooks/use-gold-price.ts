import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGoldPrice() {
  const { data, error, isLoading } = useSWR('/api/market/live', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  return {
    prices: {
      oz: data?.price,
      g: data?.gram,
      kg: data?.kilo,
    },
    change: data?.change_24h,
    isLoading,
    isError: error,
  };
}
