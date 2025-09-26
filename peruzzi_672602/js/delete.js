document.addEventListener('DOMContentLoaded',() => {
    init()
})

function init (){

    document.getElementById('home_page').addEventListener('click', () => {window.location.href = '../index.php'})
    document.getElementById('delete').addEventListener('click',del)

}


async function del(){

    let username = document.getElementById('username').value
    let password = document.getElementById('password').value
    let confirm_password = document.getElementById('confirm_password').value

    let username_pattern = /^[a-zA-Z]([a-zA-Z0-9]){4,9}$/;
    let password_pattern = /^(?=.*[@.!])[a-zA-Z0-9@.!]{5,10}$/;

    if(!username_pattern.test(username) || !password_pattern.test(password)){
        error_message('Username or Password has been incorrectly entered')
        value_clear()
        return
    }

    if(confirm_password !== password){
        error_message('Username or Password has been incorrectly entered')
        value_clear()
        return
    }

    if(username === 'DELETED'){
        error_message("Username does not exist")
        value_clear()
        return
    }

    const data = new FormData()
    data.append('username',username)
    data.append('password',password)
    data.append('confirm_password',confirm_password)

    const response = await fetch('../php/delete_request.php',{
        method: 'POST',
        body: data
    })

    if(response.ok){
        success_message('Account deleted successfully')
        value_clear()
        return
    }

    if(response.status === 401){
        const err = await response.json()
        error_message(err.message)
        value_clear()
        return
    }

    window.location.href = 'errors/' + get_error_message(response.status) + '.html'

}


function value_clear(){
    document.getElementById('username').value = ''
    document.getElementById('password').value = ''
    document.getElementById('confirm_password').value = ''
}