class ApiError extends Error{
    constructor(statusCode, message, details = null){
        super(message);

        this.statusCode = statusCode,
        this.details = details

        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends ApiError{
    constructor(message = 'Bad Request', details = null){
        super(400, message, details)
    }
}
class NotFoundError extends ApiError{
    constructor(message = 'Not Found', details = null){
        super(404, message, details)
    }
}
class TooManyRequestError extends ApiError{
    constructor(message = 'Api Rate Limit Reached', details = null){
        super(429, message, details)
    }
}
class InternalServerError extends ApiError{
    constructor(message = 'Internal Server Error', details = null){
        super(500, message, details)
    }
}

class UnauthorizedError extends ApiError{
    constructor(message = 'Unauthorized', details = null){
        super(401, message, details)
    }
}

class ValidationError extends ApiError{
    constructor(message = 'Validation Error', details){
        super(400, message, details)
    }
}

class ConflictError extends ApiError{
    constructor(message = 'Conflict Error', details = null){
        super(409, message, details)
    }
}

export {
    ApiError,
    BadRequestError,
    NotFoundError,
    TooManyRequestError,
    InternalServerError,
    UnauthorizedError,
    ValidationError,
    ConflictError
}