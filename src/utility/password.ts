import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import * as dotenv from 'dotenv';

dotenv.config();

export async function hashPassword(password: string): Promise<string> {
  const saltOrRounds = process.env.SALT_ROUNDS as string;
  return bcrypt.hash(password, +saltOrRounds);
}
