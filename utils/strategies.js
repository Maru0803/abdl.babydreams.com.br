const passport = require("passport")
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { database } = require("./database.js");
require('dotenv').config()

passport.serializeUser((user, done) => {
    console.log("[SERIALIZER]:", user)
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log("[DESERIALIZER]:", id)
    var user = await database.ref(`login/${id}`).once("value")
    if (user) done(null, user.val());
});

passport.use("home", new GoogleStrategy({
    clientID: process.env.googleapikey,
    clientSecret: process.env.googleclientsecret,
    callbackURL: 'https://starfish-app-6bc4k.ondigitalocean.app/auth/checkout',
   scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[LOGIN]: Conectado", profile._json)
        var ref = database.ref(`login/${profile.id}`)
        ref.set(profile._json)
        done(null, profile);
    } catch (err) {
        console.log("[LOGIN]: Erro", err)
        done(err, null);
    }
}));

passport.use("cart", new GoogleStrategy({
    clientID: process.env.googleapikey,
    clientSecret: process.env.googleclientsecret,
    callbackURL: 'https://starfish-app-6bc4k.ondigitalocean.app/auth/checkout',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[LOGIN]: Conectado", profile._json)
        var ref = database.ref(`login/${profile.id}`)
        ref.set(profile._json)
        done(null, profile);
    } catch (err) {
        console.log("[LOGIN]: Erro", err)
        done(err, null);
    }
}));
