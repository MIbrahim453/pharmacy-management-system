const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message
    }
    if( data !== null){
        response.data = data
    }
    return res.status(statusCode).json(response)
}

const sendError = (res, message = 'False', statusCode, details = null) => {
    const response = {
        success: false,
        message
    }
    if( details !== null){
        response.details = details
    }
    return res.status(statusCode).json(response)
}

const sendCreated = (res, data = null, message = 'Created') => {
    return sendSuccess(res, data, message, 201)
}

export { 
    sendSuccess,
    sendCreated,
    sendError
}