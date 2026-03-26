import { useState, useEffect } from "react";
import { listingAPI } from "@/shared/services/api";
import toast from "react-hot-toast";

export const useListingDetail = (id) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await listingAPI.getById(id);
        setListing(data.data.listing);
      } catch (err) {
        if (err?.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  return { listing, loading, notFound, setListing };
};
