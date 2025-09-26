
<?php

session_start();
session_unset();
session_destroy();

?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../images/pezzi/pawn_white.svg">
    <title>Chess</title>

    <link rel="stylesheet" href="../css/ranking.css">
    <script src="../js/ranking.js"></script>
    <script src="../js/error_handling.js"></script>

</head>
<body>
    <div id="title">
        <img src="../images/pezzi/rook_white.svg" alt="">
        TOP FIVE
        <img src="../images/pezzi/knight_white.svg" alt="">
    </div>
    <div id="container">

        <table>
            <thead>
                <tr>
                    <td class="first_col"><div>Number</div></td>
                    <td class="second_col"><div>Username</div></td>
                    <td class="third_col"><div>Elo</div></td>
                </tr>
            </thead>
            <tbody id="ranks">
                
            </tbody>
        </table>

    </div>
    <button id="home_page">Return to home page</button>
</body>
</html>