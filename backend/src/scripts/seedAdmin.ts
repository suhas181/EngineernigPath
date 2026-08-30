import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { connectDB } from '../config/db';

const seedAdmin = async () => {
  try {
    console.log('[SEED] Connecting to database...');
    await connectDB();

    const adminName = process.env.ADMIN_NAME || 'System Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@engineerpath.com').toLowerCase().trim();
    const isProduction = process.env.NODE_ENV === 'production';
    const rawAdminPassword = process.env.ADMIN_PASSWORD;

    if (isProduction) {
      if (!rawAdminPassword || rawAdminPassword.trim() === '' || rawAdminPassword === 'Admin@12345') {
        console.error(
          '[SECURITY ERROR] In production, ADMIN_PASSWORD must be explicitly configured in environment variables and cannot use default fallback passwords.'
        );
        process.exit(1);
      }
      if (rawAdminPassword.length < 12) {
        console.error('[SECURITY ERROR] In production, ADMIN_PASSWORD must be at least 12 characters long.');
        process.exit(1);
      }
    }

    const adminPassword = rawAdminPassword || 'Admin@12345';

    console.log(`[SEED] Checking if admin user '${adminEmail}' already exists...`);

    let existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log(`[SEED] Existing user '${adminEmail}' updated to 'admin' role!`);
      } else {
        console.log(`[SEED] Admin account '${adminEmail}' already exists. No changes needed.`);
      }
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      college: 'EngineerPath Headquarter',
      branch: 'Administration',
      preferredCareer: 'System Admin',
    });

    console.log('\n======================================================');
    console.log('🎉 ADMIN USER SEEDED SUCCESSFULLY');
    console.log('======================================================');
    console.log(` Name     : ${admin.name}`);
    console.log(` Email    : ${admin.email}`);
    console.log(` Role     : ${admin.role}`);
    console.log(` ID       : ${admin._id}`);
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
