document.addEventListener('DOMContentLoaded', init)

let games = []



function init(){
    
    document.getElementById('home_page').addEventListener('click',() => window.location.href = '../index.php')
    document.getElementById('log_in').addEventListener('click', log_in)

}

async function log_in(){

    let username = document.getElementById('username').value
    let password = document.getElementById('password').value

    document.getElementById('username').value = ''
    document.getElementById('password').value = ''

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

    const response = await fetch('../php/check_game_requests.php?type=login',{
        method: 'POST',
        body: data
    })
    
    if(response.ok){
        games = await response.json()
        login_success()
        return
    }
    
    if(response.status === 401){
        let err = await response.json()
        error_message(err.message)
        return
    }
    window.location.href = '../html/errors/' + get_error_message(response.status) + '.html'

}


function login_success(){

    let children = document.body.childNodes
    while(children[0]) document.body.removeChild(children[0])

    create_board()

}


async function create_board(){

    let container = document.createElement('div')
    container.id = 'board_container'
    
    let title = document.createElement('div')
    //title.innerText = 'Your Games'
    title.id = 'title'

    let txt = document.createTextNode('Your Games')
    let img1 = document.createElement('img')
    img1.src = '../images/pezzi/rook_white.svg'
    let img2 = document.createElement('img')
    img2.src = '../images/pezzi/knight_white.svg'

    title.appendChild(img1)
    title.appendChild(txt)
    title.appendChild(img2)

    let table = document.createElement('table')
    table.id = 'game_board'

    for(let i = 0 ; i < 6 ; ++i){
        let tr = document.createElement('tr')
        tr.id = i

        for(let j = 0 ; j < 4 ; ++j){
            let td = document.createElement('td')
            let div = document.createElement('div')

            if(i !== 0 && games[i - 1] === undefined){
                div.innerText = '/'
            }else{

                switch(j){
                    case 0:
                        td.classList.toggle('first_col')
                        if(i === 0) div.appendChild(create_img('white'))
                        else div.innerText = games[i - 1].white_player
                        break
                    case 1:
                        td.classList.toggle('second_col')
                        if(i === 0) div.appendChild(create_img('black'))
                        else div.innerText = games[i - 1].black_player
                        break
                    case 2:
                        td.classList.toggle('third_col')
                        if(i === 0) div.innerText = 'Mode'
                        else div.innerText = get_mode_txt(games[i - 1].mode)
                        break
                    default:
                        td.classList.toggle('fourth_col')
                        if(i === 0) div.innerText = 'Winner'
                        else if(games[i-1].winner !== null) div.innerText = games[i-1].winner
                        else div.innerText = 'Draw'
                        break

                }
            }
            
            td.appendChild(div)
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }

    let btn = document.createElement('button')
    btn.id = 'home_page'
    btn.innerText = 'Return to home page'
    btn.addEventListener('click',() => window.location.href = '../index.php')

    container.appendChild(btn)
    container.appendChild(title)
    container.appendChild(table)
    document.body.appendChild(container)
}


function get_mode_txt(mode){

    switch(Number(mode)){
        case 0:
            return 'blitz'
        case 1:
            return 'rapid'
        case 2:
            return 'standard'
    }

}


function create_img(color){

    let img = document.createElement('img')
    img.src = '../images/pezzi/pawn_' + color + '.svg'
    return img

}

