import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function seedUsers() {
  const adminEmail = 'admin@example.com';
  const userEmail = 'user@example.com';
  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({
      username: 'admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('Admin#1234', 10),
      role: 'admin',
    });
  }
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    await User.create({
      username: 'user',
      email: userEmail,
      passwordHash: await bcrypt.hash('User#1234', 10),
      role: 'user',
    });
  }
}
