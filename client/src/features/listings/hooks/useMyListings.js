import { useState, useCallback } from "react";
import { listingAPI } from "@/shared/services/api";
import toast from "react-hot-toast";

export const useMyListings = (initialPage = 1) => {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const { data } = await listingAPI.getMyListings({ page: pg, limit: 9 });
      setListings(data.data.listings);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleListingUpdate = (updated) => {
    setListings((prev) => prev.map((l) => (l._id === updated._id ? { ...l, ...updated } : l)));
  };

  const handleListingDelete = (id) => {
    setListings((prev) => prev.map((l) => (l._id === id ? { ...l, status: "EXPIRED" } : l)));
  };

  return {
    listings,
    setListings,
    pagination,
    page,
    setPage,
    loading,
    fetchListings,
    handleListingUpdate,
    handleListingDelete,
  };
};
