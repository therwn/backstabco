import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { User } from '@/types/albion'

// Environment variables kontrolü
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1401636182202388501'
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'rBH_DdF38X1fvMCuTq0EfgwMeVZjY-LG'
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1366161562238451853'
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Debug için environment variables'ları kontrol edelim
console.log('DISCORD_CLIENT_ID:', DISCORD_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('DISCORD_CLIENT_SECRET:', DISCORD_CLIENT_SECRET ? 'SET' : 'NOT SET')
console.log('DISCORD_GUILD_ID:', DISCORD_GUILD_ID ? 'SET' : 'NOT SET')
console.log('NEXTAUTH_URL:', NEXTAUTH_URL)

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
          
          // Guild kontrolü yap
          const isInGuild = await checkUserInGuild(discordId)
          if (!isInGuild) {
            throw new Error('NOT_IN_GUILD')
          }
          
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

async function checkUserInGuild(discordId: string): Promise<boolean> {
  try {
    // Discord API'den kullanıcının guild'lerini al
    const response = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
      headers: {
        'Authorization': `Bearer ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Discord API error:', response.status)
      return false
    }

    const guilds = await response.json()
    const isInTargetGuild = guilds.some((guild: any) => guild.id === DISCORD_GUILD_ID)
    
    console.log('User guilds:', guilds.map((g: any) => g.name))
    console.log('Is in target guild:', isInTargetGuild)
    
    return isInTargetGuild
  } catch (error) {
    console.error('Error checking user guild membership:', error)
    // Hata durumunda güvenlik için false döndür
    return false
  }
}

async function determineUserRole(discordId: string): Promise<'admin' | 'player'> {
  try {
    // Discord API'den kullanıcının guild'deki rollerini al
    const response = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Error fetching user roles:', response.status)
      return 'player'
    }

    const member = await response.json()
    const adminRoleIds = process.env.DISCORD_ADMIN_ROLE_IDS?.split(',') || []
    
    console.log('User roles:', member.roles)
    console.log('Admin role IDs:', adminRoleIds)
    
    // Admin rolü kontrolü
    const hasAdminRole = member.roles.some((roleId: string) => adminRoleIds.includes(roleId))
    
    return hasAdminRole ? 'admin' : 'player'
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