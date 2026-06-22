import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      conditions?: string[]
      goals?: string[]
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    conditions?: string[]
    goals?: string[]
  }
}