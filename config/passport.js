const jwtStrat = require("passport-jwt").Strategy;
const jwtExtract = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose"); // MongoDB ORM
const User = mongoose.model("users");
const keys = require("../config/keys");

const options = {};
options.jwtFromRequest = jwtExtract.fromAuthHeaderAsBearerToken();
options.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new jwtStrat(options, (jwt_payload, done) => {
      // console.log(jwt_payload);
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
