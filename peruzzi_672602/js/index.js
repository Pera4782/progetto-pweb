
document.addEventListener('DOMContentLoaded', () => {
    init()
})

function init() {
    document.getElementById('play_button').addEventListener('click', play)
    document.getElementById('check_games_button').addEventListener('click',() => {
        window.location.href = 'html/check_games.php'
    })

    let login_btns = document.querySelectorAll('.login_btn')
    for (let btn of login_btns) {
        btn.addEventListener('click', () => send_login(btn.id))
    }

    let mode_select_btns = document.getElementById('mode_container').childNodes
    for(let btn of mode_select_btns){
        btn.addEventListener('click',select_mode)
    }

    let reset_btns = document.querySelectorAll('.reset_btn')
    for(let btn of reset_btns){
        btn.addEventListener('click',() => reset(btn.id))
    }


    document.getElementById('menu_icon').addEventListener('click',open_menu)

}


async function play() {
    try {

        const response = await fetch('php/login_signin.php?type=logged')

        if (!response.ok) throw new Error(get_error_message(response.status))

        const users_logged = await response.json()
        
        if (!users_logged) {
            error_message('2 players need to log in')
            return;
        }
        window.location.href = 'html/game.php'

    }
    catch (e) {
        window.location.href = 'html/errors/' + e.message + '.html'
        return
    }
}


async function send_login(player) {
    let username = document.getElementById('player_' + player).value
    let password = document.getElementById('player_' + player + '_pass').value

    document.getElementById('player_' + player).value = ''
    document.getElementById('player_' + player + '_pass').value = ''

    
    let username_pattern = /^[a-zA-Z]([a-zA-Z0-9]){4,9}$/;
    let password_pattern = /^(?=.*[@.!])[a-zA-Z0-9@.!]{5,10}$/;
    
    if(!username_pattern.test(username) || !password_pattern.test(password)){
        error_message('Username or Password has been incorrectly entered')
        return
    }
    
    if (username == 'DELETED'){
        error_message("Username does not exist")
        return
    }
    
    let data = new FormData()

    data.append('username',username)
    data.append('password',password)
    data.append('player',player)

    
    const response = await fetch('php/login_signin.php?type=send_login',{
        method: 'POST',
        body: data
    })
    
    if(response.ok){
        const elo = await response.json()
        login_success(username,elo,player)
        return
    }
    
    if(response.status === 401){
        let err = await response.json()
        error_message(err.message)
        return
    }
    window.location.href = 'html/errors/' + get_error_message(response.status) + '.html'
}





async function login_success(username,elo,player) {
    
    const box = document.querySelector('#player_box_' + player)
    while(box.hasChildNodes()) box.removeChild(box.firstChild)

    const username_text = document.createElement('div')
    username_text.classList.toggle('text')
    username_text.innerText = 'Username:'
    const username_container = document.createElement('div')
    username_container.classList.toggle('text')
    username_container.innerText = username

    const elo_text = document.createElement('div')
    elo_text.innerText = 'Elo:'
    elo_text.classList.toggle('text')
    const elo_container = document.createElement('div')
    elo_container.classList.toggle('text')
    elo_container.innerText = elo

    const logout_container = document.createElement('div')
    const log_out = document.createElement('button')
    logout_container.appendChild(log_out)
    log_out.innerText = 'Log out'

    log_out.id = 'log_out_' + player
    log_out.addEventListener('click',logout)

    box.className = 'logged_player'

    box.appendChild(username_text)
    box.appendChild(username_container)
    box.appendChild(elo_text)
    box.appendChild(elo_container)
    box.appendChild(logout_container)
}


async function logout(e) {
    
    const player = e.target.id.replace('log_out_','')

    const data = new FormData()
    data.append('player',player)
    const response = await fetch('php/login_signin.php?type=log_out',{
        method: 'POST',
        body: data
    })

    if(!response.ok){
        window.location.href = get_error_message(response.status)
    }

    const player_box = document.getElementById('player_box_' + player)
    while(player_box.hasChildNodes()) player_box.removeChild(player_box.firstChild)

    const user_label = document.createElement('label')
    user_label.for = 'player_' + player
    user_label.innerText = 'Username: '

    const user_input = document.createElement('input')
    user_input.type = 'text'
    user_input.required = true;
    user_input.name = 'player_' + player
    user_input.id = 'player_' + player
    user_input.placeholder = (player === '1') ? 'Mario' : 'Tommaso'
    

    const pass_label = document.createElement('label')
    pass_label.for = 'player_' + player + '_pass'
    pass_label.innerText = 'Password: '

    const pass_input = document.createElement('input')
    pass_input.type = 'password'
    pass_input.required = true;
    pass_input.name = 'player_' + player + '_pass'
    pass_input.id = 'player_' + player + '_pass'
    pass_input.placeholder = '••••••••'

    const log_in_btn = document.createElement('button')
    log_in_btn.addEventListener('click',() => send_login(player))
    log_in_btn.id = player
    log_in_btn.classList.toggle('login_btn')
    log_in_btn.innerText = 'Log in'

    const reset_btn = document.createElement('button')
    reset_btn.id = 'reset_' + player
    reset_btn.classList.toggle('reset_btn')
    reset_btn.addEventListener('click',() => reset(reset_btn.id))
    reset_btn.innerText = 'Reset'

    player_box.appendChild(user_label)
    player_box.appendChild(user_input)
    player_box.appendChild(pass_label)
    player_box.appendChild(pass_input)
    player_box.appendChild(log_in_btn)
    player_box.appendChild(reset_btn)

}




async function select_mode(e) {
    e.stopPropagation()
    document.querySelector('.selected_mode').classList.toggle('selected_mode')
    e.target.classList.toggle('selected_mode')
    
    let [time,inc] = e.target.id.split('|')
    const data = new FormData()

    data.append('initial_time',time)
    data.append('time_increment',inc)

    try{
        const response = await fetch('php/game_requests.php?type=set_mode',{
            method: 'POST',
            body: data
        })
        if(!response.ok) throw new Error(get_error_message(response.status))
    }catch(e){
        window.location.href = 'html/errors/' + e.message + '.html'
    }

}

function reset(id){
    
    let player = 'player_' + id.replace('reset_','')

    document.getElementById(player).value = ''
    document.getElementById(player + '_pass').value = ''

}

function open_menu(){
    const menu = document.getElementById('menu')
    while(menu.hasChildNodes()) menu.removeChild(menu.firstChild)

    menu.className = 'open_menu'

    const info_page_btn = document.createElement('button')
    info_page_btn.innerText = 'Info Page'
    info_page_btn.addEventListener('click', () => window.location.href = 'html/info.html')
    const sign_in_btn = document.createElement('button')
    sign_in_btn.innerText = 'Sign In'
    sign_in_btn.addEventListener('click', () => window.location.href = 'html/signin.php')
    const ranking_btn = document.createElement('button')
    ranking_btn.innerText = 'Top Five'
    ranking_btn.addEventListener('click',() => window.location.href = 'html/ranking.php')
    const delete_acc_btn = document.createElement('button')
    delete_acc_btn.innerText = 'Delete account'
    delete_acc_btn.addEventListener('click',() => window.location.href = 'html/delete_acc.php')
    const close_menu_btn = document.createElement('button')
    close_menu_btn.innerText = 'Close'
    close_menu_btn.addEventListener('click',close_menu)

    let div = document.createElement('div')
    div.addEventListener('click', close_menu)
    div.id = 'close'
    document.body.appendChild(div)

    menu.appendChild(info_page_btn)
    menu.appendChild(sign_in_btn)
    menu.appendChild(ranking_btn)
    menu.appendChild(delete_acc_btn)
    menu.appendChild(close_menu_btn)

}

function close_menu(){
    const menu = document.getElementById('menu')
    menu.className = 'closed_menu'
    while(menu.hasChildNodes()) menu.removeChild(menu.firstChild)
    document.body.removeChild(document.getElementById('close'))
    
    const menu_img = document.createElement('img')
    menu_img.src = 'images/menu.svg'
    menu_img.addEventListener('click',open_menu)
    menu.appendChild(menu_img)
}

