const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const { getUser, createUser } = require('../database');

// Serialize and deserialize user ID
passport.serializeUser((user, done) => {
    done(null, user.id);
}), (id, done) => {
    getUser(id)
        .then(user => {
            done(null, user);
        }).catch(err => {
            done(err);
        }
    );
}
passport.deserializeUser((id, done) => {
    getUser(id)
        .then(user => {
            done(null, user);
        }).catch(err => {
            done(err);
        })
    }
)


passport.use(
    new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CLIENT_REDIRECT,
        scope: ["identify", "guilds"]
    }, async (accessToken, refreshToken, profile, done) => {
        let id = profile.id
        let user = await getUser(id)
        if (!user) {
            user = await createUser(id)
        }
        done(null, user)
    })
)