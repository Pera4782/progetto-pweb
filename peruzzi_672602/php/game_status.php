<?php

define('MAX_DIM', 8);

if (!defined('ACCESS_ALLOWED')) {
    http_response_code(403);
    header('Location: ../html/errors/Forbidden.html');
    exit;
}


class Piece
{
    public $color;
    public $type;

    public function __construct($color, $type)
    {
        $this->color = $color;
        $this->type = $type;
    }
}

class Pawn extends Piece
{
    public $en_passant_left;
    public $en_passant_right;
    public function __construct($color, $type)
    {
        parent::__construct($color, $type);
        $this->en_passant_left = false;
        $this->en_passant_right = false;
    }
}


class Castling_piece extends Piece
{
    public $moved;
    public function __construct($color, $type)
    {
        parent::__construct($color, $type);
        $this->moved = false;
    }
}


function initiate_board()
{

    $board = [[], [], [], [], [], [], [], []];

    for ($i = 0; $i < MAX_DIM; $i++) {
        for ($j = 0; $j < MAX_DIM; $j++) {


            if ($i >= 2 && $i <= 5) {
                $board[$i][$j] = new Piece(null, null);
                continue;
            }

            $color;
            if ($i < 2)
                $color = 'black';
            elseif ($i > 5)
                $color = 'white';
            else
                $color = null;


            if ($i == 1 || $i == 6) {
                $board[$i][$j] = new Pawn($color, 'pawn');
            } else if ($j == 0 || $j == 7) {
                $board[$i][$j] = new Castling_piece($color, 'rook');
            } else if ($j == 1 || $j == 6) {
                $board[$i][$j] = new Piece($color, 'knight');
            } else if ($j == 2 || $j == 5) {
                $board[$i][$j] = new Piece($color, 'bishop');
            } else if ($j == 3) {
                $board[$i][$j] = new Piece($color, 'queen');
            } else {
                $board[$i][$j] = new Castling_piece($color, 'king');
            }

        }
    }
    return $board;
}

class game_status
{
    public $white_player;
    public $black_player;
    public $initial_time;
    public $time_increment;
    public $board;
    public $turn;
    public $end_game_status;

    public function __construct($white_player, $black_player, $initial_time, $time_increment, $board, $turn)
    {
        $this->white_player = $white_player;
        $this->black_player = $black_player;
        $this->initial_time = $initial_time;
        $this->time_increment = $time_increment;
        $this->board = $board;
        $this->turn = $turn;
        $this->end_game_status = ['condition' => 0, 'color' => null];
    }
}
?>