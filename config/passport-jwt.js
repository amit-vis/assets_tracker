const passport = require("passport");
const {Strategy, ExtractJwt} = require("passport-jwt");
const User = require("../model/user");

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
}

// code for stablishing the authentication
passport.use(new Strategy(opts, async (jwt_payload, done)=>{
    try {
        const user = await User.findById(jwt_payload._id);
        if(user){
            return done(null, user)
        }
        return done(null, false)
    } catch (error) {
        return done(error)
    }
}));

module.exports = passport;