
function init_interface(game) {

    create_board(game)

    document.getElementById('white_time').innerText = get_time_in_minutes(game.players.white.time)
    document.getElementById('black_time').innerText = get_time_in_minutes(game.players.black.time)

    create_pause_button()
    document.getElementById('pause').addEventListener('click', () => { pause(game) })

    document.getElementById('white_player').innerText = game.players.white.name
    document.getElementById('black_player').innerText = game.players.black.name

    draw(game.board, game.players)
}



function create_board(game) {

    let table = document.createElement('table')
    for (let i = 0; i < MAX_DIM; ++i) {
        let tr = document.createElement('tr');
        for (let j = 0; j < MAX_DIM; ++j) {

            let td = document.createElement('td');
            let div = document.createElement('div')
            div.id = get_id(i, j);
            td.id = 'td' + get_id(i, j)

            div.addEventListener('click', (e) => { game.select(e) })
            td.addEventListener('click', (e) => { game.select(e) })

            td.appendChild(div)
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }
    document.getElementById('board').appendChild(table);
}



function create_pause_button() {

    let body = document.body
    let pause_btn = document.createElement('button')
    pause_btn.id = 'pause'
    pause_btn.innerText = 'pause'
    body.appendChild(pause_btn)
}


function draw(board, players) {
    for (let i = 0; i < MAX_DIM; ++i) {
        for (let j = 0; j < MAX_DIM; ++j)
            if (board[i][j].type !== null) {

                let box = document.getElementById(get_id(i, j))
                if (box.firstChild) box.removeChild(box.firstChild)
                let image = document.createElement('img')
                image.src = '../images/pezzi/' + board[i][j].type + '_' + board[i][j].color + '.svg'
                image.id = 'img' + get_id(i, j)
                box.appendChild(image)

            }
            else document.getElementById(get_id(i, j)).innerText = ''
    }

    for (let p of PIECES) {
        if (p === 'king') continue
        document.getElementById('eaten_white_' + p).innerText = 'x' + players.white.eaten_pieces[p]
        document.getElementById('eaten_black_' + p).innerText = 'x' + players.black.eaten_pieces[p]
    }
}

function draw_time(color, time) {
    document.getElementById(color + '_time').innerText = get_time_in_minutes(time)
}

function draw_possible_moves(board, possible_moves) {
    for (let pm of possible_moves) {
        let [i_temp, j_temp] = pm.split('|')
        i_temp = parseInt(i_temp)
        j_temp = parseInt(j_temp)
        if (board[i_temp][j_temp].type === null)
            document.getElementById(pm).classList.toggle('yellow_dot')
        else
            document.getElementById(pm).classList.toggle('red_box', true)
    }
}

function clear_possible_moves() {

    let yellow_dots = document.querySelectorAll('.yellow_dot')
    let red_boxes = document.querySelectorAll('.red_box')
    for (let y of yellow_dots) {
        y.classList.toggle('yellow_dot')
    }
    for (let r of red_boxes) {
        r.classList.toggle('red_box')
    }
}


function pause(game) {
    game.paused = true;
    create_pause_menu(game)
}

function create_pause_menu(game) {

    game.paused = true;

    const COLOR = (game.white_turn) ? 'white' : 'black'

    let container = document.createElement('div')
    container.id = 'container'

    let pause_menu = document.createElement('div')
    pause_menu.id = 'menu'

    let pause_text = document.createElement('h1')
    pause_text.innerText = 'PAUSE'
    pause_menu.appendChild(pause_text)

    let image_cont = document.createElement('div')
    image_cont.id = 'img_container'
    let img = document.createElement('img')
    img.src = '../images/pezzi/pawn_' + COLOR + '.svg'
    image_cont.appendChild(img)

    let surrender = document.createElement('button')
    let return_to_game = document.createElement('button')

    surrender.innerText = 'Surrender'
    return_to_game.innerText = 'Return to game'

    surrender.addEventListener('click', () => {
        document.body.removeChild(container)
        end_game((game.white_turn) ? 'black' : 'white', 1, game)
    })
    return_to_game.addEventListener('click', () => {
        document.body.removeChild(container)
        game.paused = false
    })

    pause_menu.appendChild(pause_text)
    pause_menu.appendChild(image_cont)
    pause_menu.appendChild(surrender)
    pause_menu.appendChild(return_to_game)
    container.appendChild(pause_menu)
    document.body.appendChild(container)
}


function draw_end_game_menu(color, game) {

    let container = document.createElement('div')
    container.id = 'container'
    let end_game_menu = document.createElement('div')
    end_game_menu.id = 'menu'
    container.appendChild(end_game_menu)

    let text = document.createElement('h1')
    text.id = 'text'
    end_game_menu.appendChild(text)

    let img_container = document.createElement('div')
    img_container.id = 'img_container'

    let img = document.createElement('img')
    img.src = '../images/pezzi/pawn_' + color + '.svg'

    img_container.appendChild(img)
    end_game_menu.appendChild(img_container)

    let back_to_main_menu = document.createElement('button')
    let rematch = document.createElement('button')

    back_to_main_menu.innerText = 'Return to main menu'
    rematch.innerText = 'Rematch'

    back_to_main_menu.id = 'back_to_main_menu.id'
    rematch.id = 'rematch'

    back_to_main_menu.addEventListener('click', async () => { 
        await game.register_game()
        window.location.href = '../index.php'
    })

    rematch.addEventListener('click', async () => {

        let body = document.body
        body.removeChild(container)
        let board_container = document.getElementById('board')
        board_container.removeChild(board_container.firstChild)
        document.body.removeChild(document.getElementById('pause'))

        await game.register_game()
        game.init()
    })
    end_game_menu.appendChild(rematch)
    end_game_menu.appendChild(back_to_main_menu)
    container.appendChild(end_game_menu)
    return container
}

function win_menu(winning_color, game) {

    let menu = draw_end_game_menu(winning_color, game)
    document.body.appendChild(menu)
    document.getElementById('text').innerText = game.players[winning_color].name + ' won!!!'
}


function draw_menu(game) {
    let menu = draw_end_game_menu('white', game)
    document.body.appendChild(menu)
    document.getElementById('text').innerHTML = 'DRAW'
}



function promotion_interface(i, j, game) {

    const COLOR = game.board[i][j].color

    let cont = document.createElement('div')
    cont.id = 'container'
    let promotion_box_container = document.createElement('div')
    promotion_box_container.classList.toggle('promotion_box_container')
    cont.appendChild(promotion_box_container)

    for (let p of PIECES) {

        if (p == 'king' || p == 'pawn') continue

        let btn = document.createElement('div')
        btn.id = p
        btn.classList.toggle('promotion_box')

        btn.addEventListener('click', (e) => {
            let chosen_piece = e.target.id
            let cont = document.getElementById('container')
            document.body.removeChild(cont)

            game.promote(i, j, chosen_piece, COLOR)

        })

        let image = document.createElement('img')
        let piece = new Piece(p, COLOR)
        image.src = piece.get_image()
        image.id = p
        btn.appendChild(image)
        promotion_box_container.appendChild(btn)
    }

    document.body.appendChild(cont)
}


