'use strict'

// FUNZIONI DI SELEZIONE PEZZO

//funzioni che restituiscono tutte le mosse possibili (da filtrare con la filter_valid_moves)


function select_pieces(i, j, board, players) {

    let boxes = []

    if (board[i][j].type === 'pawn')
        boxes = select_pawn(i, j, board)
    else if (board[i][j].type === 'rook')
        boxes = select_rook(i, j, board)
    else if (board[i][j].type === 'bishop')
        boxes = select_bishop(i, j, board)
    else if (board[i][j].type === 'knight')
        boxes = select_knight(i, j, board)
    else if (board[i][j].type === 'queen')
        boxes = select_queen(i, j, board)
    else if (board[i][j].type === 'king')
        boxes = select_king(i, j, board, players)

    return boxes
}




function select_pawn(i, j, board) {

    let boxes = []

    const STEP = (board[i][j].color === 'white') ? -1 : 1
    const OPP_COLOR = (board[i][j].color === 'white') ? 'black' : 'white'
    if (i + STEP < 0 || i + STEP > 7) return

    if (j !== 0) {
        if (board[i + STEP][j - 1].color === OPP_COLOR) boxes.push(get_id(i + STEP, j - 1))
    }
    if (j !== 7) {
        if (board[i + STEP][j + 1].color === OPP_COLOR) boxes.push(get_id(i + STEP, j + 1))
    }

    const MAX_STEP = ((i === 1 && STEP > 0) || (i === 6 && STEP < 0)) ? 2 : 1
    for (let k = 1; k <= MAX_STEP; ++k) {
        if (board[i + k * STEP][j].color !== null) break
        else boxes.push(get_id(i + k * STEP, j))
    }

    if (board[i][j].en_passant_left && boxes.indexOf(get_id(i + STEP, j - 1)) < 0) {
        boxes.push(get_id(i + STEP, j - 1))
    }
    if (board[i][j].en_passant_right && boxes.indexOf(get_id(i + STEP, j + 1)) < 0) {
        boxes.push(get_id(i + STEP, j + 1))
    }

    return boxes
}


function select_rook(i, j, board) {

    let boxes = []

    for (let k = j + 1; k < MAX_DIM; ++k) {
        if (board[i][k].type !== null) {
            if (board[i][k].color !== board[i][j].color) boxes.push(get_id(i, k))
            break
        }
        boxes.push(get_id(i, k))
    }
    for (let k = j - 1; k >= 0; --k) {
        if (board[i][k].type !== null) {
            if (board[i][k].color !== board[i][j].color) boxes.push(get_id(i, k))
            break
        }
        boxes.push(get_id(i, k))
    }
    for (let k = i + 1; k < MAX_DIM; ++k) {
        if (board[k][j].type !== null) {
            if (board[k][j].color !== board[i][j].color) boxes.push(get_id(k, j))
            break
        }
        boxes.push(get_id(k, j))
    }
    for (let k = i - 1; k >= 0; --k) {
        if (board[k][j].type !== null) {
            if (board[k][j].color !== board[i][j].color) boxes.push(get_id(k, j))
            break
        }
        boxes.push(get_id(k, j))
    }

    return boxes
}


function select_bishop(i, j, board) {

    let boxes = []

    for (let k = 1; i + k < MAX_DIM && j + k < MAX_DIM; ++k) {
        if (board[i + k][j + k].type !== null) {
            if (board[i + k][j + k].color !== board[i][j].color) boxes.push(get_id(i + k, j + k))
            break
        }
        boxes.push(get_id(i + k, j + k))
    }
    for (let k = 1; i - k >= 0 && j + k < MAX_DIM; ++k) {
        if (board[i - k][j + k].type !== null) {
            if (board[i - k][j + k].color !== board[i][j].color) boxes.push(get_id(i - k, j + k))
            break
        }
        boxes.push(get_id(i - k, j + k))
    }
    for (let k = 1; i + k < MAX_DIM && j - k >= 0; ++k) {
        if (board[i + k][j - k].type !== null) {
            if (board[i + k][j - k].color !== board[i][j].color) boxes.push(get_id(i + k, j - k))
            break
        }
        boxes.push(get_id(i + k, j - k))
    }
    for (let k = 1; i - k >= 0 && j - k >= 0; ++k) {
        if (board[i - k][j - k].type !== null) {
            if (board[i - k][j - k].color !== board[i][j].color) boxes.push(get_id(i - k, j - k))
            break
        }
        boxes.push(get_id(i - k, j - k))
    }

    return boxes
}


function select_queen(i, j, board) {
    let boxes = []
    boxes = boxes.concat(select_bishop(i, j, board))
    boxes = boxes.concat(select_rook(i, j, board))
    return boxes
}

function select_knight(i, j, board) {

    let boxes = []

    if (i < MAX_DIM - 2 && j < MAX_DIM - 1) {
        if (board[i][j].color !== board[i + 2][j + 1].color) boxes.push(get_id(i + 2, j + 1))
    }
    if (i < MAX_DIM - 2 && j > 0) {
        if (board[i][j].color !== board[i + 2][j - 1].color) boxes.push(get_id(i + 2, j - 1))
    }

    if (i < MAX_DIM - 1 && j > 1) {
        if (board[i][j].color !== board[i + 1][j - 2].color) boxes.push(get_id(i + 1, j - 2))
    }
    if (i > 0 && j > 1) {
        if (board[i][j].color !== board[i - 1][j - 2].color) boxes.push(get_id(i - 1, j - 2))
    }

    if (i > 1 && j < MAX_DIM - 1) {
        if (board[i][j].color !== board[i - 2][j + 1].color) boxes.push(get_id(i - 2, j + 1))
    }
    if (i > 1 && j > 0) {
        if (board[i][j].color !== board[i - 2][j - 1].color) boxes.push(get_id(i - 2, j - 1))
    }

    if (i < MAX_DIM - 1 && j < MAX_DIM - 2) {
        if (board[i][j].color !== board[i + 1][j + 2].color) boxes.push(get_id(i + 1, j + 2))
    }
    if (i > 0 && j < MAX_DIM - 2) {
        if (board[i][j].color !== board[i - 1][j + 2].color) boxes.push(get_id(i - 1, j + 2))
    }
    return boxes
}

function select_king(i, j, board, players) {

    let boxes = []

    if (i < MAX_DIM - 1 && board[i][j].color !== board[i + 1][j].color)
        boxes.push(get_id(i + 1, j))
    if (i > 0 && board[i][j].color !== board[i - 1][j].color)
        boxes.push(get_id(i - 1, j))
    if (j < MAX_DIM - 1 && board[i][j].color !== board[i][j + 1].color)
        boxes.push(get_id(i, j + 1))
    if (j > 0 && board[i][j].color !== board[i][j - 1].color)
        boxes.push(get_id(i, j - 1))
    if (i < MAX_DIM - 1 && j < MAX_DIM - 1 && board[i][j].color !== board[i + 1][j + 1].color)
        boxes.push(get_id(i + 1, j + 1))
    if (i < MAX_DIM - 1 && j > 0 && board[i][j].color !== board[i + 1][j - 1].color)
        boxes.push(get_id(i + 1, j - 1))
    if (i > 0 && j < MAX_DIM - 1 && board[i][j].color !== board[i - 1][j + 1].color)
        boxes.push(get_id(i - 1, j + 1))
    if (i > 0 && j > 0 && board[i][j].color !== board[i - 1][j - 1].color)
        boxes.push(get_id(i - 1, j - 1))

    //ARROCCO CORTO

    const COLOR = board[i][j].color
    const OPP_COLOR = (COLOR === 'white') ? 'black' : 'white'

    if (!checked(COLOR, players)) {
        if (!board[i][j].moved && board[i][7].type === 'rook' && board[i][7].color === board[i][j].color && board[i][7].moved === false) {
            let flag = false
            for (let k = j + 1; k < MAX_DIM - 1; ++k) {
                if (board[i][k].type !== null || players[OPP_COLOR].attacked_pos.indexOf(i + '|' + k) >= 0) {
                    flag = true
                    break
                }
            }
            if (!flag) boxes.push(get_id(i, 7))
        }

        //ARROCCO LUNGO

        if (!board[i][j].moved && board[i][0].type === 'rook' && board[i][0].color === board[i][j].color && board[i][0].moved === false) {
            let flag = false
            for (let k = j - 1; k > 0; --k) {
                if (board[i][k].type !== null || players[OPP_COLOR].attacked_pos.indexOf(i + '|' + k) >= 0) {
                    flag = true
                    break
                }
            }
            if (!flag) boxes.push(get_id(i, 0))
        }
    }
    return boxes
}

//FILTRAGGIO DELLE MOSSE NON VALIDE

//funzione che restituisce un vettore che contiene le mosse di moves che non mandano sotto scacco il re nella tavola board

function filter_valid_moves(i, j, moves, board, players) {

    if (moves === undefined) return null

    const COLOR = board[i][j].color
    const OPP_COLOR = (COLOR === 'white') ? 'black' : 'white'

    let king_status_copy = { i: players[COLOR].king_status.i, j: players[COLOR].king_status.j }
    let board_copy = [...board]

    let bad_moves = []
    let good_moves = [...moves]

    for (let move of good_moves) {
        let eaten_piece = null
        eaten_piece = sim_move(move, i, j, board_copy, king_status_copy)
        let attacked_pos = calc_attacked_pos(OPP_COLOR, board_copy, players)

        if (checked(attacked_pos, king_status_copy)) bad_moves.push(move)
        undo_move(move, i, j, board_copy, eaten_piece, king_status_copy)
    }
    good_moves = good_moves.filter((move) => { return (bad_moves.indexOf(move) < 0) })

    return good_moves
}
