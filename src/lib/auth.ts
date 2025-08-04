import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { User } from '@/types/albion'

// Environment variables kontrolü
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1401636182202388501'
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'rBH_DdF38X1fvMCuTq0EfgwMeVZjY-LG'
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1366161562238451853'

// Debug için environment variables'ları kontrol edelim
console.log('DISCORD_CLIENT_ID:', DISCORD_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('DISCORD_CLIENT_SECRET:', DISCORD_CLIENT_SECRET ? 'SET' : 'NOT SET')
console.log('DISCORD_GUILD_ID:', DISCORD_GUILD_ID ? 'SET' : 'NOT SET')

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordId = (profile as { id?: string; sub?: string }).id || profile.sub
        if (discordId) {
          token.discordId = discordId
          token.role = await determineUserRole(discordId)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.discordId = token.discordId as string
        session.user.role = token.role as 'admin' | 'player'
      }
      return session
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  debug: true // Debug modunu açalım
}

async function determineUserRole(discordId: string): Promise<'admin' | 'player'> {
  try {
    // Geçici olarak basit kontrol - daha sonra Discord API ile değiştirilecek
    const adminRoleIds = process.env.DISCORD_ADMIN_ROLE_IDS?.split(',') || []
    
    console.log('Discord ID:', discordId)
    console.log('Admin role IDs:', adminRoleIds)
    
    // Şimdilik tüm kullanıcıları player olarak ayarlayalım
    // Daha sonra Discord Bot Token ile gerçek rol kontrolü yapacağız
    console.log('Defaulting to player role for now')
    return 'player'
  } catch (error) {
    console.error('Error determining user role:', error)
    return 'player'
  }
}

declare module 'next-auth' {
  interface Session {
    user: User
  }
  
  interface JWT {
    discordId: string
    role: 'admin' | 'player'
  }
} 