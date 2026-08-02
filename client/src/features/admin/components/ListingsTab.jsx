import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { adminAPI } from "@/shared/services/api";
import { notify } from "@/shared/services/notify";
import { PageControls, TableSkeleton } from "./AdminTabShared";

const ListingsTab = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "listings", page, statusFilter],
    queryFn: () =>
      adminAPI.getListings({ page, limit: 10, ...(statusFilter && { status: statusFilter }) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (listingId) => adminAPI.deleteListing(listingId),
    onSuccess: () => {
      notify.success("Listing removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Could not remove listing"),
  });

  const handleDelete = (listingId) => {
    if (window.confirm("Remove this listing? This cannot be undone.")) {
      deleteMutation.mutate(listingId);
    }
  };

  const listings = data?.data?.data?.listings || [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : listings.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">No listings found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {listings.map((l) => (
                <tr key={l._id} className="text-slate-700 dark:text-slate-300">
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {l.seller?.firstName} {l.seller?.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{l.college?.name || "—"}</td>
                  <td className="px-4 py-3">₹{l.price}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-white/10">
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.status !== "EXPIRED" && (
                      <button
                        onClick={() => handleDelete(l._id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PageControls page={page} totalPages={pagination?.totalPages} onChange={setPage} />
    </div>
  );
};

export default ListingsTab;
