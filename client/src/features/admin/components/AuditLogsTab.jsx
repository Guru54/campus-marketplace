import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/shared/services/api";
import { PageControls, TableSkeleton } from "./AdminTabShared";

const ACTIONS = [
  "REGISTER",
  "VERIFY_OTP",
  "RESEND_OTP",
  "LOGIN",
  "LOGOUT",
  "FORGOT_PASSWORD_REQUEST",
  "RESET_PASSWORD",
  "CHANGE_PASSWORD",
  "CREATE_LISTING",
  "UPDATE_LISTING",
  "DELETE_LISTING",
  "ACCOUNT_LOCKED",
  "USER_BANNED",
  "USER_UNBANNED",
];

const AuditLogsTab = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "auditLogs", page, actionFilter],
    queryFn: () =>
      adminAPI.getAuditLogs({ page, limit: 15, ...(actionFilter && { action: actionFilter }) }),
  });

  const logs = data?.data?.data?.logs || [];
  const pagination = data?.data?.data?.pagination;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300"
        >
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">No log entries found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="text-slate-700 dark:text-slate-300">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-white/10">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{log.ip}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
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

export default AuditLogsTab;
