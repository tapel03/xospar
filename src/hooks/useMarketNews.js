import { useCallback, useEffect, useState } from "react";
import { fetchMarketNews } from "../services/api/newsService";

const REFRESH_INTERVAL = 5 * 60 * 1000;

export function useMarketNews() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const latest = await fetchMarketNews({
        timespan: "6h",
        maxRecords: 50,
      });

      setStories(latest);
    } catch (err) {
      console.error("[useMarketNews]", err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNews();

    const interval = setInterval(() => {
      loadNews(true);
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [loadNews]);

  const refresh = useCallback(() => {
    loadNews(true);
  }, [loadNews]);

  return {
    stories,
    loading,
    refreshing,
    error,
    refresh,
  };
}