'use strict'

document.addEventListener('DOMContentLoaded', function () {
    let game = new Game()
    game.start()
})


const MAX_DIM = 8
const PIECES = ['rook', 'knight', 'bishop', 'queen', 'pawn', 'king']

class Player {

    constructor(name, time, king_i, king_j) {
        this.name = name
        this.time = time
        this.eaten_pieces = { queen: 0, bishop: 0, knight: 0, rook: 0, pawn: 0 }
        this.king_status = { i: king_i, j: king_j }
        this.attacked_pos = []
    }
}

class Piece {
    constructor(type, color) {
        this.type = type
        this.color = color
    }

    get_image() {
        return '../images/pezzi/' + this.type + '_' + this.color + '.svg'
    }

}


class Game {

    constructor() {
        this.board = [[], [], [], [], [], [], [], []]

        this.selected = false
        this.previous_clicked_box = { i: 0, j: 0 }
        this.possible_moves = []

        this.players = {
            white: null,
            black: null
        }

        this.TIME_INCREMENT = null
        this.INITIAL_TIME = null

        this.white_turn = true
        this.paused = false
        this.timer = null

    }

    async start() {
        const first_request = await is_first_request()
        if (first_request) await this.init()
        else await this.reload()
    }


    async init() {

        let response = null
        try {
            response = await fetch(PHP_REQUEST_URL + 'get_info')
            if (!response.ok) throw new Error(get_error_message(response.status))
        } catch (e) {
            window.location.href = '../html/errors/' + e.message + '.html'
            return
        }
        const info = await response.json()
        this.board = info.board

        this.selected = false
        this.previous_clicked_box.i = 0
        this.previous_clicked_box.j = 0
        this.possible_moves = []

        this.INITIAL_TIME = parseInt(info.initial_time)
        this.TIME_INCREMENT = parseInt(info.time_increment)

        this.players.white = new Player(info.white_player, this.INITIAL_TIME, 7, 4)
        this.players.black = new Player(info.black_player, this.INITIAL_TIME, 0, 4)

        this.white_turn = true
        this.paused = false

        this.players.white.attacked_pos = calc_attacked_pos('white', this.board, this.players)
        this.players.black.attacked_pos = calc_attacked_pos('black', this.board, this.players)

        await this.send_status()
        await send_end_game(0, null)

        init_interface(this)
        this.init_timer()
        draw(this.board, this.players)

    }

    async reload() {

        let response = null
        try {
            response = await fetch(PHP_REQUEST_URL + 'reload_game')
            if (!response.ok) throw new Error(get_error_message(response.status))
        } catch (e) {
            window.location.href = '../html/errors/' + e.message + '.html'
            return
        }


        const info = await response.json()

        this.INITIAL_TIME = parseInt(info.initial_time)
        this.TIME_INCREMENT = parseInt(info.time_increment)

        this.players.white = info.white_player
        this.players.black = info.black_player

        this.white_turn = info.turn
        this.board = info.board

        this.players.white.attacked_pos = calc_attacked_pos('white', this.board, this.players)
        this.players.black.attacked_pos = calc_attacked_pos('black', this.board, this.players)


        init_interface(this)
        this.init_timer()
        draw(this.board, this.players)

        if (info.end_game_status.condition)
            end_game(info.end_game_status.color, info.end_game_status.condition, this)
    }


    init_timer() {

        this.timer = setInterval(() => {

            if (this.paused) return
            const COLOR = (this.white_turn) ? 'white' : 'black'

            if (this.players[COLOR].time === 0) {
                clearInterval(this.timer)
                const OPP_COLOR = (this.white_turn) ? 'black' : 'white'
                end_game(OPP_COLOR, 1, this)
                return
            }

            this.players[COLOR].time--
            draw_time(COLOR, this.players[COLOR].time)

            send_time(this.players[COLOR].time, COLOR)
        }, 1000)
    }


    async send_status() {

        const json_board = JSON.stringify(this.board)
        const json_white_player = JSON.stringify(this.players.white)
        const json_black_player = JSON.stringify(this.players.black)
        const json_init_time = JSON.stringify(this.INITIAL_TIME)
        const json_time_increment = JSON.stringify(this.TIME_INCREMENT)
        const json_turn = JSON.stringify(this.white_turn)

        const data = new FormData()
        data.append('board', json_board)
        data.append('white', json_white_player)
        data.append('black', json_black_player)
        data.append('initial_time', json_init_time)
        data.append('time_increment', json_time_increment)
        data.append('turn', json_turn)

        try {
            let response = await fetch(PHP_REQUEST_URL + 'send_status', {
                method: 'POST',
                body: data
            })
            if (!response.ok) throw new Error(get_error_message(response.status))
        } catch (e) {
            window.location.href = '../html/errors/' + e.message + '.html'
            return
        }
    }


    async register_game(){


        try{
            let response = await fetch(PHP_REQUEST_URL + 'register_game', {
                method: 'POST'
            })

            if(!response.ok) throw new Error(get_error_message(response.status))
        }catch(e){
            window.location.href = '../html/errors/' + e.message + '.html'
        }

    }



    // EVENTO DI CLICK

    select(e) {
        e.stopPropagation()

        let id = e.target.id
        if (e.target.tagName === 'IMG') id = id.replace('img', '')
        if (e.target.tagName === 'TD') id = id.replace('td', '')

        let [i, j] = id.split('|')
        i = parseInt(i)
        j = parseInt(j)

        const CLICKED_TYPE = this.board[i][j].type
        const CLICKED_COLOR = this.board[i][j].color
        const OLD_TYPE = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j].type
        const OLD_COLOR = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j].color

        //se non è selezionato nulla e viene clickato un pezzo del colore avversario non succede niente
        if (!this.selected && ((CLICKED_COLOR === 'white' && !this.white_turn) || (CLICKED_COLOR === 'black' && this.white_turn))) return

        //se non è stato selezionato niente oppure viene clickato un altro pezzo dello stesso colore e non c'è un arrocco si seleziona il nuovo pezzo
        //altrimenti si procede con la mossa
        if (!this.selected || (CLICKED_TYPE !== null && CLICKED_COLOR === OLD_COLOR)
            && !(CLICKED_TYPE === 'rook' && CLICKED_COLOR === OLD_COLOR && OLD_TYPE === 'king' && document.getElementById(get_id(i, j)).classList.length !== 0)) {

            clear_possible_moves()

            let possible_moves = select_pieces(i, j, this.board, this.players)
            this.previous_clicked_box.i = i
            this.previous_clicked_box.j = j

            if (possible_moves.length == 0) return

            possible_moves = filter_valid_moves(i, j, possible_moves, this.board, this.players)
            if (possible_moves.length === 0) return

            this.possible_moves = possible_moves
            this.selected = true
            draw_possible_moves(this.board, possible_moves)

        } else this.move_piece(i, j)
    }


    move_piece(i, j) {

        clear_possible_moves()

        const OLD_COLOR = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j].color
        const OLD_TYPE = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j].type

        this.selected = false
        let match = false

        match = this.possible_moves.indexOf(get_id(i, j))
        this.possible_moves = []
        if (match < 0) return

        //se sto muovendo un re o una torre metto il suo campo moved a true
        if (OLD_TYPE === 'rook' || OLD_TYPE === 'king')
            this.board[this.previous_clicked_box.i][this.previous_clicked_box.j].moved = true

        //se sto muovendo un pedone di 2 accanto a un pedone avversario setto il suo campo en passant
        //corrispondente a true
        if (OLD_TYPE === 'pawn' && Math.abs(i - this.previous_clicked_box.i) === 2) {
            if (j < 7 && this.board[i][j + 1].type === 'pawn' && this.board[i][j + 1].color !== OLD_COLOR)
                this.board[i][j + 1].en_passant_left = true
            if (j > 0 && this.board[i][j - 1].type === 'pawn' && this.board[i][j - 1].color !== OLD_COLOR)
                this.board[i][j - 1].en_passant_right = true
        }

        let castle_flag = false
        let move_type = null

        if (this.board[i][j].type === 'rook' && this.board[i][j].color === OLD_COLOR) { //castle

            move_type = this.castle(i, j, OLD_COLOR)
            castle_flag = true

        } else if (OLD_TYPE === 'pawn' && Math.abs(j - this.previous_clicked_box.j) === 1 && this.board[i][j].type === null)  //EN PASSANT

            move_type = this.en_passant(i, j)

        else move_type = this.regular_move(i, j) //MOVIMENTO REGOLARE

        //se ho mosso un pedone setto i suoi campi en passant a false
        if (this.board[i][j].type === 'pawn') {
            this.board[i][j].en_passant_left = false
            this.board[i][j].en_passant_right = false
        }

        //se non ho arroccato e ho mosso il re aggiorno la sua posizione in modo regolare
        if (!castle_flag && OLD_TYPE === 'king') {
            this.players[OLD_COLOR].king_status.i = i
            this.players[OLD_COLOR].king_status.j = j
        }

        draw(this.board, this.players)

        //se un pedone è arrivato in fondo parte la promozione
        let promo_flag = false
        if (this.board[i][j].type === 'pawn' && ((i === 0 && this.board[i][j].color === 'white') || (i === 7 && this.board[i][j].color === 'black'))) {
            promotion_interface(i, j, this)
            promo_flag = true
        }

        //se non c'è stata una promozione aggiorno lo stato in modo regolare
        if (!promo_flag) this.update_status(OLD_COLOR)

        let condition = this.win_check()
        if (condition !== 0) {
            const WINNING_COLOR = (this.white_turn) ? 'black' : 'white'
            end_game(WINNING_COLOR, condition, this)
        }

    }


    castle(rook_i, rook_j, color) {

        let king_step = (rook_j === 7) ? 2 : -2
        let rook_step = (rook_j === 7) ? -2 : 3

        this.board[this.previous_clicked_box.i][king_step + this.previous_clicked_box.j] = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j]
        this.board[rook_i][rook_step + rook_j] = this.board[rook_i][rook_j]

        this.board[rook_i][rook_j] = new Piece(null, null)
        this.board[this.previous_clicked_box.i][this.previous_clicked_box.j] = new Piece(null, null)

        this.players[color].king_status.i = this.previous_clicked_box.i
        this.players[color].king_status.j = king_step + this.previous_clicked_box.j
        return 'c'
    }

    en_passant(i, j) {

        let step = i - this.previous_clicked_box.i

        this.players[this.board[i - step][j].color].eaten_pieces.pawn++

        this.board[i - step][j] = new Piece(null, null)
        this.board[i][j] = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j]
        this.board[this.previous_clicked_box.i][this.previous_clicked_box.j] = new Piece(null, null)
        return 'e'
    }

    regular_move(i, j) {

        if (this.board[i][j].type !== null) {
            const COLOR = this.board[i][j].color
            const TYPE = this.board[i][j].type
            this.players[COLOR].eaten_pieces[TYPE]++
        }

        this.board[i][j] = this.board[this.previous_clicked_box.i][this.previous_clicked_box.j]
        this.board[this.previous_clicked_box.i][this.previous_clicked_box.j] = new Piece(null, null)

        return 'r'
    }


    async update_status(color) {
        this.players.white.attacked_pos = calc_attacked_pos('white', this.board, this.players)
        this.players.black.attacked_pos = calc_attacked_pos('black', this.board, this.players)
        this.white_turn = !this.white_turn
        this.players[color].time += this.TIME_INCREMENT
        draw_time(color, this.players[color].time)
        await this.send_status()
    }


    promote(i, j, chosen_piece, color) {
        this.board[i][j] = new Piece(chosen_piece, color)
        draw(this.board, this.players)
        this.update_status(color)
    }


    //CONTROLLO DELLA VITTORIA

    //funzione che ritorna 0 se la partita non è finita 1 se c'è un vincitore e 2 se c'è pareggio

    win_check() {

        //controllo se sono rimasti solo i 2 re

        let materiale_insufficiente = true
        let bishop_counter = {
            white: 0,
            black: 0
        }
        for (let i = 0; i < MAX_DIM; ++i) {
            for (let j = 0; j < MAX_DIM; ++j) {

                if (this.board[i][j].type === 'bishop') bishop_counter[this.board[i][j].color]++

                if (this.board[i][j].type !== null && (this.board[i][j].type !== 'king' || this.board[i][j].type !== 'knight'
                    || this.board[i][j].type !== 'bishop') || bishop_counter.white !== 2 || bishop_counter.black !== 2) {

                    materiale_insufficiente = false
                    break
                }
            }
        }

        if (materiale_insufficiente) return 2

        const COLOR = (this.white_turn) ? 'white' : 'black'
        const OPP_COLOR = (this.white_turn) ? 'black' : 'white'
        const CHECKED = checked(this.players[OPP_COLOR].attacked_pos, this.players[COLOR].king_status)
        let all_possible_moves = []

        for (let i = 0; i < MAX_DIM; ++i) {
            for (let j = 0; j < MAX_DIM; ++j) {
                if (this.board[i][j].color !== COLOR) continue

                let possible_moves = select_pieces(i, j, this.board, this.players)
                possible_moves = filter_valid_moves(i, j, possible_moves, this.board, this.players)

                if (possible_moves === null) continue

                all_possible_moves = all_possible_moves.concat(...possible_moves)

            }
        }
        //for che restituisce tutte le mosse valide nella conformazione attuale

        if (all_possible_moves.length == 0 && CHECKED) return 1
        else if (all_possible_moves.length == 0 && !CHECKED) return 2
        return 0
    }


}


//funzione che restituisce true se il re è sotto scacco con le posizioni attaccate attcked_pos

function checked(attacked_pos, king_status) {
    if (attacked_pos.indexOf(king_status.i + '|' + king_status.j) < 0) return false
    return true
}

//funzione che restituisce un vettore con le posizioni "attaccate" dal colore color sulla tabella board

function calc_attacked_pos(color, board, players) {

    let positions = []

    for (let i = 0; i < MAX_DIM; ++i) {
        for (let j = 0; j < MAX_DIM; ++j) {

            if (board[i][j].color !== color) continue

            let boxes = []
            //se il pezzo in pos i,j non è un pedone le posizioni "attaccate" coincidono con le mosse disponibili
            if (board[i][j].type !== 'pawn') {
                boxes = select_pieces(i, j, board, players)
                if (board[i][j].type == 'king') {

                    boxes = boxes.filter((box) => {
                        let [x, y] = box.split('|')
                        x = parseInt(x)
                        y = parseInt(y)
                        return !(board[x][y].type === 'rook' && board[x][y].color === board[i][j].color)
                    }) // rimozione della casella dell'arrocco (non è una casella "attaccata")
                }
                //se il pezzo è un pedone le caselle "attaccate" sono quelle in diagonale davanti a lui 
            } else {
                const STEP = (board[i][j].color === 'white') ? -1 : 1
                if (j !== 0)
                    boxes.push(get_id(i + STEP, j - 1))
                if (j !== 7)
                    boxes.push(get_id(i + STEP, j + 1))
            }
            if (boxes.length !== 0)
                for (let b of boxes) { if (positions.indexOf(b) < 0) positions.push(b) }

        }
    }
    return positions
}


function get_id(i, j) {
    return i + '|' + j
}



function get_time_in_minutes(s) {

    let seconds = s % 60
    let minutes = Math.floor(s / 60)

    if (seconds >= 10)
        return minutes + ' : ' + seconds
    else
        return minutes + ' : 0' + seconds
}

//funzione che simula una mossa move sul pezzo board[i][j] e eventualmente aggiorna il k_status
//restituisce il pezzo catturato, se non venisse catturato nessun pezzo restituisce Piece(null,null) 
function sim_move(move, old_i, old_j, board, k_status) {

    let [new_i, new_j] = move.split('|')
    new_i = parseInt(new_i)
    new_j = parseInt(new_j)
    let eaten_piece = null
    eaten_piece = board[new_i][new_j]
    board[new_i][new_j] = board[old_i][old_j]
    board[old_i][old_j] = new Piece(null, null)

    if (board[new_i][new_j].type === 'king') {
        k_status.i = new_i
        k_status.j = new_j
    }

    return eaten_piece
}

//funzione che torna indietro su una mossa move sul pezzo board[i][j] mette al suo posto eaten_piece e eventualmente aggiorna
//il k_status
function undo_move(move, new_i, new_j, board, eaten_piece, k_status) {

    let [old_i, old_j] = move.split('|')
    old_i = parseInt(old_i)
    old_j = parseInt(old_j)
    board[new_i][new_j] = board[old_i][old_j]
    board[old_i][old_j] = eaten_piece

    if (board[new_i][new_j].type === 'king') {
        k_status.i = new_i
        k_status.j = new_j
    }

}


function end_game(winning_color, condition, game) {

    clearInterval(game.timer)

    if (condition == 1) { // vittoria
        send_end_game(condition, winning_color)
        win_menu(winning_color, game)
    } else { // patta
        send_end_game(condition, null)
        draw_menu(game)
    }
}
