const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const FacebookStrategy = require('passport-facebook').Strategy;

// Đăng nhập bằng Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: profile.displayName || "Google User",
                email,
                password: Math.random().toString(36).slice(-8),
            });
        }

        return done(null, {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        return done(error, null);
    }
}));

// Đăng nhập bằng Facebook
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: profile.displayName || "Facebook User",
                email,
                password: Math.random().toString(36).slice(-8),
            });
        }

        return done(null, {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        return done(error, null);
    }
}));

module.exports = passport;