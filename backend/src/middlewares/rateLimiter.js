import rateLimiter from 'express-rate-limit'
import logger from '../utils/logger.js';
import { TooManyRequestError } from '../utils/errors.js'

const defaultLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: 'Too many requests please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req,res,next) => {
    logger.warn('Rate limit reached', {
        ip: req.ip,
        path: req.path,
        url: req.originalUrl,
        requestId: req.requestId,
    })
    next(new TooManyRequestError('Too many requests please try again later'))
  }  
})

const authLimiter = rateLimiter({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    message: 'Too many login attempts please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        logger.warn('Auth rate limit reached', {
            ip: req.ip,
            path: req.path,
            url: req.originalUrl,
            requestId: req.requestId,
        })
        next(new TooManyRequestError('Too many login attempts please try again later'))
    }
})

const verificationLimiter = rateLimiter({
    windowMs: 10 * 60 * 1000,
    limit: 3,
    message: 'Too many verification attempts please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        logger.warn('Verification rate limit reached', {
            ip: req.ip,
            path: req.path,
            url: req.originalUrl,
            requestId: req.requestId,
        })
        next(new TooManyRequestError('Too many verification attempts please try again later'))
    }
})

const passwordResetLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: 'Too many password reset attempts please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        logger.warn('Password reset rate limit reached', {
            ip: req.ip,
            path: req.path,
            url: req.originalUrl,
            requestId: req.requestId,
        })
        next(new TooManyRequestError('Too many password reset attempts please try again later'))
    }
})

export {
    defaultLimiter,
    authLimiter,
    verificationLimiter,
    passwordResetLimiter
}