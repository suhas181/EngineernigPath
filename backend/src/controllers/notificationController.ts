import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { Notification } from '../models/Notification';

const INITIAL_NOTIFICATIONS = [
  {
    isBroadcast: true,
    title: '🤖 AI Resume ATS Optimization',
    message: 'Run your resume through the AI ATS Analyzer to benchmark against top tech employers and get actionable fixes.',
    type: 'ai_suggestion' as const,
    link: '/resume',
  },
  {
    isBroadcast: true,
    title: '🌐 Web Development Roadmap Live',
    message: 'Explore our newly curated Step-by-Step Web Development, MERN Stack, and PostgreSQL curriculum in Learning Hub.',
    type: 'learning_resource' as const,
    link: '/resources',
  },
  {
    isBroadcast: true,
    title: '💼 Bangalore Tech Internships',
    message: 'Fresh internship openings with direct official application links at top Indian unicorns and product teams.',
    type: 'internship_alert' as const,
    link: '/internships',
  },
  {
    isBroadcast: true,
    title: '🎯 Career Roadmap Initialized',
    message: 'Personalized engineering tracks with language isolation (Java, Python, C++) are ready for your milestones.',
    type: 'milestone' as const,
    link: '/roadmaps',
  },
];

/**
 * Seed starter notifications if collection is empty
 */
async function ensureInitialNotifications(): Promise<void> {
  const count = await Notification.countDocuments();
  if (count === 0) {
    await Notification.insertMany(INITIAL_NOTIFICATIONS);
  }
}

/**
 * GET /api/notifications
 * Returns user's notifications along with unreadCount
 */
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await ensureInitialNotifications();

    const notifications = await Notification.find({
      $or: [{ userId: user._id }, { isBroadcast: true }, { userId: null }],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const formatted = notifications.map((n) => {
      const isRead = Array.isArray(n.readBy) && n.readBy.some(
        (readId: any) => readId.toString() === user._id.toString()
      );
      return {
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link || '',
        isRead,
        createdAt: n.createdAt,
      };
    });

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read by current user
 */
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    // Add user._id to readBy if not already present
    const alreadyRead = notification.readBy.some(
      (readId) => readId.toString() === user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push(user._id);
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all visible notifications as read for current user
 */
export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Find all notifications visible to this user
    await Notification.updateMany(
      {
        $or: [{ userId: user._id }, { isBroadcast: true }, { userId: null }],
        readBy: { $ne: user._id },
      },
      {
        $addToSet: { readBy: user._id },
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications
 * Create a new notification (broadcast or targeted)
 */
export const createNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, message, type, link, userId, isBroadcast } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required' });
      return;
    }

    const newNotification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type: type || 'system_announcement',
      link: link || '',
      userId: userId || null,
      isBroadcast: isBroadcast !== undefined ? Boolean(isBroadcast) : !userId,
      readBy: [],
    });

    res.status(201).json({
      success: true,
      notification: newNotification,
    });
  } catch (error) {
    next(error);
  }
};
