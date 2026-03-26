import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useMyListings } from "@/features/listings/hooks/useMyListings";
import { EditListingModal } from "@/features/listings/components/EditListingModal";
import { DeleteConfirmModal } from "@/features/listings/components/DeleteConfirmModal";
import { MyListingCard } from "@/features/listings/components/MyListingCard";

const Skeleton = () => (
  <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="aspect-video bg-slate-200 dark:bg-white/10" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const MyListings = () => {
  const { listings, pagination, page, setPage, loading, fetchListings, handleListingUpdate, handleListingDelete } = useMyListings();
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchListings(page);
  }, [page, fetchListings]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(125%_125%_at_50%_80%,#030a1c_40%,#040425_90%)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Listings</h1>
            {pagination && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {pagination.total} listing{pagination.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition"
          >
            <Plus size={16} /> New Listing
          </Link>
        </div>

        {loading ? (
          <Skeleton />
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4 text-3xl">
              <Package size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No listings yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs">
              Post your first item and start selling to your campus!
            </p>
            <Link
              to="/create"
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition"
            >
              <Plus size={16} /> Create Listing
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <MyListingCard
                  key={listing._id}
                  listing={listing}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                      pg === pagination.page
                        ? "bg-indigo-500 text-white"
                        : "border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {editTarget && (
          <EditListingModal
            key="edit"
            listing={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={(updated) => {
              handleListingUpdate(updated);
              setEditTarget(null);
            }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirmModal
            key="delete"
            listing={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={(id) => {
              handleListingDelete(id);
              setDeleteTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default MyListings;
