import '../loadEnv.js'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'

const [name, email, password] = process.argv.slice(2)

if (!name || !email || !password) {
  console.error('Usage: node scripts/createFirm.js "<firm name>" <email> <password>')
  process.exit(1)
}

const hashed = await bcrypt.hash(password, 12)

const firm = await prisma.firm.create({
  data: { name, email, password: hashed },
})

console.log(`Created firm ${firm.name} (${firm.email})`)
await prisma.$disconnect()
