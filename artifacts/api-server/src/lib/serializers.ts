import type { User } from "@workspace/db";

export function serializeUser(u: User) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    email: u.email,
    gender: u.gender as "male" | "female",
    country: u.country,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    isAdmin: u.isAdmin,
    isMainAdmin: u.isMainAdmin,
    isActive: u.isActive,
    createdAt: u.createdAt,
  };
}
