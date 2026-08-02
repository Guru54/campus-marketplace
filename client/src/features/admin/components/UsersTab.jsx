import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2 } from "lucide-react";
import { adminAPI } from "@/shared/services/api";
import { notify } from "@/shared/services/notify";
import { PageControls, TableSkeleton } from "./AdminTabShared";

const UsersTab = () => {
  const [page, setPage] = useState(1);
  const [isBannedFilter, setIsBannedFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, isBannedFilter],
    queryFn: () =>
      adminAPI.getUsers({ page, limit: 10, ...(isBannedFilter && { isBanned: isBannedFilter }) }),
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }) => adminAPI.banUser(userId, reason),
    onSuccess: () => {
      notify.success("User banned");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Could not ban user"),
  });

  const unbanMutation = useMutation({
    mutationFn: (userId) => adminAPI.unbanUser(userId),
    onSuccess: () => {
      notify.success("User unbanned");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => notify.error(err?.response?.data?.message || "Could not unban user"),
  });

  const handleBan = (userId) => {
    const reason = window.prompt("Reason for ban (optional):") || "";
    banMutation.mutate({ userId, reason });
  };

  const users = data?.data?.data?.users || [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select
          value={isBannedFilter}
          onChange={(e) => {
            setIsBannedFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300"
        >
          <option value="">All users</option>
          <option value="false">Active only</option>
          <option value="true">Banned only</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">No users found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="text-slate-700 dark:text-slate-300">
                  <td className="px-4 py-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.college?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-white/10">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 dark:bg-red-500/10 text-red-500">Banned</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role === "ADMIN" ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : u.isBanned ? (
                      <button
                        onClick={() => unbanMutation.mutate(u._id)}
                        disabled={unbanMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBan(u._id)}
                        disabled={banMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <Ban size={14} /> Ban
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

export default UsersTab;
