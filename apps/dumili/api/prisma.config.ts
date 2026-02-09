import 'dotenv/config'
import type { PrismaConfig } from 'prisma/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const prismaConfig: PrismaConfig = {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
}

export default prismaConfig
