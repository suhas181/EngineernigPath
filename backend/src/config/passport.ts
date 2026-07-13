import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Find existing user by email
        let user = await User.findOne({ email });

        if (user) {
          // If user exists but doesn't have googleId, update it
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isVerified = true; // Google email is verified
            await user.save();
          }
          return done(null, user);
        }

        // Create new user if not found
        user = await User.create({
          name: profile.displayName || profile.name?.givenName || 'Google User',
          email,
          googleId: profile.id,
          isVerified: true,
          profileImage: profile.photos?.[0]?.value || '',
        });

        return done(null, user);
      } catch (error: any) {
        return done(error, undefined);
      }
    }
  )
);

// We are not using sessions, but passport requires these declarations
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
