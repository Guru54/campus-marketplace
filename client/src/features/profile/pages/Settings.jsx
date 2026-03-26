import { useState, useRef } from "react";
import { Camera, Lock, Save, Eye, EyeOff } from "lucide-react";
import { userAPI } from "@/shared/services/api";
import { useAuth } from "@/context/AuthContext";
import { getAvatarUrl } from "@/shared/utils/avatar";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, login } = useAuth();
  const initialAvatar = getAvatarUrl(user);

  // ── Profile form ─────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar || null);
  const [savingProfile,  setSavingProfile]  = useState(false);
  const fileInputRef = useRef(null);

  // ── Password form ────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [savingPwd,   setSavingPwd]   = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  // ── Handlers ─────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error("Name cannot be empty"); return;
    }
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append("firstName", profile.firstName.trim());
      fd.append("lastName",  profile.lastName.trim());
      if (avatarFile) fd.append("avatar", avatarFile);

      const { data } = await userAPI.updateProfile(fd);

      // Update context + localStorage
      const updatedUser = { ...user, ...data.data.user };
      login(updatedUser);

      setAvatarFile(null);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    setSavingPwd(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      toast.success("Password changed!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password change failed");
    } finally {
      setSavingPwd(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition";

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-[radial-gradient(125%_125%_at_50%_80%,#030a1c_40%,#040425_90%)]">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile and account</p>
        </div>

        {/* ── Edit Profile ── */}
        <section className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Edit Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow transition cursor-pointer"
              >
                <Camera size={13} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Profile Photo</p>
              <p className="text-xs text-slate-400 mt-0.5">JPG, PNG · Max 5 MB</p>
              {avatarFile && <p className="text-xs text-indigo-500 mt-1">New photo selected ✓</p>}
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  maxLength={30}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                <input
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  maxLength={30}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Static fields */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input value={user?.email ?? ""} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
            >
              <Save size={14} />
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>

        {/* ── Change Password ── */}
        <section className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={15} /> Change Password
          </h2>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  className={inputClass + " pr-10"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  className={inputClass + " pr-10"}
                  placeholder="Min 8 chars, upper + lower + number"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                className={`${inputClass} ${
                  passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword
                    ? "border-red-400 focus:ring-red-400"
                    : ""
                }`}
                placeholder="Repeat new password"
              />
              {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPwd || !passwords.currentPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Lock size={14} />
              {savingPwd ? "Updating…" : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Settings;
