import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable not set")
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo mode: hardcoded credentials
        const DEMO_EMAIL = "demo@nutriscan.com"
        const DEMO_PASSWORD = "demo123"

        if (
          credentials.email === DEMO_EMAIL &&
          credentials.password === DEMO_PASSWORD
        ) {
          return {
            id: "demo-user-1",
            email: DEMO_EMAIL,
            name: "Demo User"
          }
        }

        // If database is available, try to find/create user
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          }).catch(() => null)

          if (user) {
            return { id: user.id, email: user.email, name: user.name }
          }

          // Create user if doesn't exist (demo mode)
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email as string,
              name: "User"
            }
          })

          return { id: newUser.id, email: newUser.email, name: newUser.name }
        } catch (error) {
          // Database unavailable, use demo fallback
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      return session
    }
  }
})
