
const PHP_REQUEST_URL = '../php/game_requests.php?type='

async function is_first_request() {

    response = null
    try {
        response = await fetch(PHP_REQUEST_URL + 'is_first_request')
        if (!response.ok) throw new Error(get_error_message(response.status))
    } catch (e) {
        window.location.href = '../html/errors/' + e.message + '.html'
        return
    }

    const is_first_request = await response.json()
    return is_first_request
}


async function send_end_game(condition, color) {
    const json_condition = JSON.stringify(condition)
    const json_color = JSON.stringify(color)
    const data = new FormData()
    data.append('condition', json_condition)
    data.append('color', json_color)
    try {
        const response = await fetch(PHP_REQUEST_URL + 'end_game', {
            method: 'POST',
            body: data
        })
        if (!response.ok) throw new Error(get_error_message(response.status))
    } catch (e) {
        window.location.href = '../html/errors/' + e.message + '.html'
        return
    }

}


async function send_time(time, color) {

    const json_time = JSON.stringify(time)

    const data = new FormData()
    data.append('time', json_time)
    data.append('color', color)

    try {
        const response = await fetch(PHP_REQUEST_URL + 'send_time', {
            method: 'POST',
            body: data
        })
        if (!response.ok) throw new Error(get_error_message(response.status))
    } catch (e) {
        window.location.href = '../html/errors/' + e.message + '.html'
        return
    }
}

