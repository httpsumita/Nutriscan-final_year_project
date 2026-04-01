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

        // TODO: Replace with actual password hashing + verification
        // For now, accept any email as a demo
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
