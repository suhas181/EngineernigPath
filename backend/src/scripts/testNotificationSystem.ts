import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController';

async function testNotificationSystem() {
  console.log('--- STARTING NOTIFICATION SYSTEM TEST ---');
  await connectDB();

  // 1. Create a test student user
  let user = await User.findOne({ email: 'notif_tester@engineerpath.com' });
  if (!user) {
    user = await User.create({
      name: 'Notification Tester',
      email: 'notif_tester@engineerpath.com',
      password: 'HashedPassword@123',
      role: 'student',
      isVerified: true,
      college: 'Test College',
      branch: 'Computer Science',
      preferredCareer: 'Full Stack Developer',
    });
  }

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

  // TEST 1: Unauthenticated request
  console.log('TEST 1: Reject unauthenticated request');
  const mockReq1: any = { user: null };
  const mockRes1 = createMockRes();
  await getNotifications(mockReq1, mockRes1, () => {});
  if (mockRes1.statusCode !== 401) {
    throw new Error(`Expected 401 but got ${mockRes1.statusCode}`);
  }
  console.log('  [PASS] Unauthenticated access rejected with 401');

  // TEST 2: GET /api/notifications
  console.log('TEST 2: Fetch notifications for user');
  const mockReq2: any = { user };
  const mockRes2 = createMockRes();
  await getNotifications(mockReq2, mockRes2, () => {});

  if (mockRes2.statusCode !== 200 || !mockRes2.body.success) {
    throw new Error(`Expected 200 success, got ${mockRes2.statusCode}`);
  }

  const notifs = mockRes2.body.notifications;
  console.log(`  [PASS] Successfully fetched ${notifs.length} notifications. Unread count: ${mockRes2.body.unreadCount}`);

  if (notifs.length === 0) {
    throw new Error('Expected initial notifications to be seeded, found 0');
  }

  const first = notifs[0];

  // TEST 3: Mark single notification read
  console.log('TEST 3: Mark single notification as read');
  const mockReq3: any = { user, params: { id: first.id } };
  const mockRes3 = createMockRes();
  await markNotificationRead(mockReq3, mockRes3, () => {});

  if (mockRes3.statusCode !== 200 || !mockRes3.body.success) {
    throw new Error(`Expected 200 on mark read, got ${mockRes3.statusCode}`);
  }

  // Verify it reflects in getNotifications
  const mockReq4: any = { user };
  const mockRes4 = createMockRes();
  await getNotifications(mockReq4, mockRes4, () => {});
  const updatedFirst = mockRes4.body.notifications.find((n: any) => n.id === first.id);
  if (!updatedFirst.isRead) {
    throw new Error('Notification should now be marked as read (isRead === true)');
  }
  console.log('  [PASS] Single notification successfully updated to read');

  // TEST 4: Mark all as read
  console.log('TEST 4: Mark all notifications as read');
  const mockReq5: any = { user };
  const mockRes5 = createMockRes();
  await markAllNotificationsRead(mockReq5, mockRes5, () => {});

  if (mockRes5.statusCode !== 200 || !mockRes5.body.success) {
    throw new Error(`Expected 200 on mark all read, got ${mockRes5.statusCode}`);
  }

  const mockReq6: any = { user };
  const mockRes6 = createMockRes();
  await getNotifications(mockReq6, mockRes6, () => {});

  if (mockRes6.body.unreadCount !== 0) {
    throw new Error(`Expected unreadCount to be 0, got ${mockRes6.body.unreadCount}`);
  }
  console.log('  [PASS] All notifications marked as read. Unread count is 0');

  // Clean up test user
  await User.deleteOne({ _id: user._id });

  console.log('\n=============================================');
  console.log('🎉 ALL NOTIFICATION SYSTEM TESTS PASSED CLEANLY');
  console.log('=============================================\n');

  await mongoose.connection.close();
  process.exit(0);
}

testNotificationSystem().catch((err) => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
