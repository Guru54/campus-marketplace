import { useState, useEffect, useCallback, useRef } from "react";
import { listingAPI } from "@/shared/services/api";
import toast from "react-hot-toast";

export const useListingsSearch = (initialParams) => {
  const [searchInput, setSearchInput] = useState(initialParams.search || "");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestTimer = useRef(null);

  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestLoading(true);
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      try {
        const { data } = await listingAPI.getSuggestions(searchInput);
        setSuggestions(data.data.suggestions || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 400);
    return () => clearTimeout(suggestTimer.current);
  }, [searchInput]);

  return {
    searchInput,
    setSearchInput,
    suggestions,
    setSuggestions,
    suggestLoading,
  };
};

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.condition) params.condition = f.condition;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      params.sort = f.sort || "newest";
      params.page = f.page || 1;
      params.limit = 12;

      const { data } = await listingAPI.getAll(params);
      setListings(data.data?.listings || []);
      setPagination(data.data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  return { listings, pagination, loading, fetchListings };
};
