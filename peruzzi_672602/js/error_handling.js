'use strict'

function get_error_message(code) {

    let message = null
    switch (code) {
        case 400:
            message = 'Bad_Request'
            break
        case 401:
            message = 'Unauthorized'
            break
        case 403:
            message = 'Forbidden'
            break
        case 404:
            message = 'Not_Found'
            break
        case 500:
            message = 'Internal_Server_Error'
            break
        default:
            message = 'Unknown_Error'
            break
    }
    return message
}

