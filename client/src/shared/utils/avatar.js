const buildSeed = (user) => {
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  if (fullName) return fullName;
  if (user?._id) return user._id;
  return "User";
};

const normalizeDicebearUrl = (url, seed) => {
  if (!url || !url.includes("api.dicebear.com/7.x/initials/svg")) return url;
  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedSeed}`;
};

export const getAvatarUrl = (user) => {
  const seed = buildSeed(user);
  const direct = user?.avatarUrl || user?.avatar;
  if (typeof direct === "string" && direct.trim()) {
    return normalizeDicebearUrl(direct.trim(), seed);
  }

  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedSeed}`;
};
