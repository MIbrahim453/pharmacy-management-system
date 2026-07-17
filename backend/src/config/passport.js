import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { config } from "./index.js";
import bcrypt from "bcrypt";
import User from "../database/models/user.model.js";
import logger from "../utils/logger.js";

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).populate("role", "name");
      if (!user) {
        logger.info("Login Attempt Failed. User Not Found");
        return done(null, false, {
          message: "User not found. Please provide correct Email and Password",
        });
      }

      if (user.status !== "active") {
        logger.info(`Login Attempt Failed. User account is ${user.status}`);
        return done(null, false, {
          message: `Your account is ${user.status}. Please contact administrator.`,
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.info("Login Attempt Failed. Invalid Password");
        return done(null, false, { message: "Invalid Credentials" });
      }
      logger.info("User login Successful");
      return done(null, user);
    } catch (error) {
      logger.error("Error occurred while authenticating user:", error);
      return done(error);
    }
  },
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
};

const jwtStrategy = new JWTStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id)
      .select("-password")
      .populate("role", "name");
    if (!user) {
      logger.info("JWT Authentication Failed. Login again");
      return done(null, false);
    }
    if (user.status !== "active") {
      logger.info(`JWT Authentication Failed. User account is ${user.status}`);
      return done(null, false, { message: `Your account is ${user.status}. Please contact administrator.` });
    }
    return done(null, user);
  } catch (error) {
    logger.error("Error in JWT strategy:", error);
    return done(error, false);
  }
});

const initializePassport = () => {
  passport.use("local", localStrategy);
  passport.use("jwt", jwtStrategy);
  logger.info("Passport strategies initialized");
};

export { passport, initializePassport };
