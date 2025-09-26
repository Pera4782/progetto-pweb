
let timeout = null


function error_message (msg){

    if(timeout !== null){
        document.body.removeChild(document.getElementById('err'))
        clearTimeout(timeout)
    }

    const container = document.createElement('div')
    container.id = 'err'
    container.innerText = msg
    container.classList.toggle('error_message')
    document.body.appendChild(container)

    timeout = setTimeout(() => {
        document.body.removeChild(container)
        timeout = null
    },3000)
}


function success_message(msg){
    if(timeout !== null){
        document.body.removeChild(document.getElementById('mess'))
        clearTimeout(timeout)
    }

    const container = document.createElement('div')
    container.id = 'mess'
    container.innerText = msg
    container.classList.toggle('success_message')
    document.body.appendChild(container)

    timeout = setTimeout(() => {
        document.body.removeChild(container)
        timeout = null
    },3000)
}

