import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import {
  getAdminNotifications,
  broadcastNotification,
  deleteAdminNotification,
} from '../controllers/adminController';
import { getNotifications } from '../controllers/notificationController';

async function testAdminBroadcast() {
  console.log('--- STARTING ADMIN NOTIFICATION BROADCASTER TEST ---');
  await connectDB();

  // Helper to create mock response
  const createMockRes = () => {
    const res: any = {};
    res.statusCode = 200;
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data: any) => {
      res.body = data;
      return res;
    };
    return res;
  };

  // 1. Create or find an Admin user
  let admin = await User.findOne({ email: 'admin_test_broadcaster@engineerpath.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Tester',
      email: 'admin_test_broadcaster@engineerpath.com',
      password: 'HashedPassword@123',
      role: 'admin',
      isVerified: true,
      college: 'HQ',
      branch: 'Admin',
      preferredCareer: 'System Admin',
    });
  }

  // 2. Create a student user to verify reception
  let student = await User.findOne({ email: 'student_recipient@engineerpath.com' });
  if (!student) {
    student = await User.create({
      name: 'Student Recipient',
      email: 'student_recipient@engineerpath.com',
      password: 'HashedPassword@123',
      role: 'student',
      isVerified: true,
      college: 'Engineering Institute',
      branch: 'Computer Science',
      preferredCareer: 'Full Stack Developer',
    });
  }

  // TEST 1: GET /api/admin/notifications
  console.log('TEST 1: Fetch admin notifications list');
  const mockReq1: any = { user: admin };
  const mockRes1 = createMockRes();
  await getAdminNotifications(mockReq1, mockRes1, () => {});

  if (mockRes1.statusCode !== 200 || !mockRes1.body.success) {
    throw new Error(`Failed to fetch admin notifications: ${mockRes1.statusCode}`);
  }
  console.log(`  [PASS] Successfully fetched ${mockRes1.body.notifications.length} admin notifications.`);

  // TEST 2: Broadcast a new notification
  console.log('TEST 2: Broadcast a new notification from Admin');
  const broadcastPayload = {
    title: '🚀 Big Tech Bangalore Internship Drive',
    message: 'Google and Microsoft opened summer applications! Check the active links now.',
    type: 'internship_alert',
    link: '/internships',
  };
  const mockReq2: any = { user: admin, body: broadcastPayload };
  const mockRes2 = createMockRes();
  await broadcastNotification(mockReq2, mockRes2, () => {});

  if (mockRes2.statusCode !== 201 || !mockRes2.body.success) {
    throw new Error(`Broadcast failed with status: ${mockRes2.statusCode}`);
  }

  const createdId = mockRes2.body.notification._id.toString();
  console.log(`  [PASS] Broadcast created successfully with ID: ${createdId}`);

  // TEST 3: Verify the broadcasted notification is received in student's bell feed
  console.log('TEST 3: Verify student receives broadcast in their notification dropdown');
  const mockReq3: any = { user: student };
  const mockRes3 = createMockRes();
  await getNotifications(mockReq3, mockRes3, () => {});

  const foundInStudent = mockRes3.body.notifications.find((n: any) => n.id === createdId);
  if (!foundInStudent) {
    throw new Error('Broadcasted notification was NOT found in student notification list!');
  }

  if (foundInStudent.title !== broadcastPayload.title || foundInStudent.link !== broadcastPayload.link) {
    throw new Error('Broadcasted notification content mismatch!');
  }
  console.log('  [PASS] Student bell dropdown properly received the broadcast!');

  // TEST 4: Delete the broadcast notification
  console.log('TEST 4: Delete broadcast notification as admin');
  const mockReq4: any = { user: admin, params: { id: createdId } };
  const mockRes4 = createMockRes();
  await deleteAdminNotification(mockReq4, mockRes4, () => {});

  if (mockRes4.statusCode !== 200 || !mockRes4.body.success) {
    throw new Error(`Failed to delete notification: ${mockRes4.statusCode}`);
  }
  console.log('  [PASS] Notification deleted successfully.');

  // Clean up test users
  await User.deleteOne({ _id: admin._id });
  await User.deleteOne({ _id: student._id });

  console.log('\n======================================================');
  console.log('🎉 ALL ADMIN BROADCAST TESTS PASSED CLEANLY');
  console.log('======================================================\n');

  await mongoose.connection.close();
  process.exit(0);
}

testAdminBroadcast().catch((err) => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
