import type { User } from "@/context/authContext"

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin"
}

export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role === role
}

export const canAccessAdminFeatures = (user: User | null): boolean => {
  return isAdmin(user)
}
