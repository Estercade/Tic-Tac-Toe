const playerFactory = function(name, marker) {
    this.name = name;
    this.marker = marker;
    return { name, marker }
}

const player1 = playerFactory("player1", "X");
const player2 = playerFactory("player2", "O");

const turnHandler = (function() {
    let currentPlayer = player1;
    let turnCounter = 1;

    function changeTurn() {
        currentPlayer === player1 ? currentPlayer = player2 : currentPlayer = player1;
        turnCounter++;
    }

    function resetTurns(e) {
        if (e.type="restartGame") {
            currentPlayer = player1;
            turnCounter = 1;
        }
    }

    function currentTurn() {
        return currentPlayer;
    }

    function turnCount() {
        return turnCounter;
    }

    return { changeTurn, resetTurns, currentTurn, turnCount };
})();

const gameboardHandler = (function() {
    let gamestate = ["X", "O", "X", "O", "X", "O", "X", "O", "X"];

    const gameboard = document.getElementById("gameboard");
    const template = document.getElementById("gameboard-square-template");

    function render() {
        for (let i = 0; i < gamestate.length; i++) {
            let clone = template.content.cloneNode(true);
            let li = clone.querySelector("li");
            li.innerText = gamestate[i];
            li.id = `gameboardSquare${i}`;
            gameboard.append(clone);
            _attachListener(li);
        }
    }

    function _attachListener(gameboardSquare) {
        gameboardSquare.addEventListener('click', _placeMarker);
    }

    const markerPlacedEvent = new Event("markerPlaced");

    function _placeMarker(e) {
        if (e.target.innerText !== "") {
            console.log("That square is not empty!");
        } else {
            let currentPlayerMarker = turnHandler.currentTurn().marker;
            let gameboardLocation = e.target.id.substring(15);
            gamestate[gameboardLocation] = currentPlayerMarker;
            e.target.innerText = currentPlayerMarker;
            _checkGamestate();
            dispatchEvent(markerPlacedEvent);
        }
    }

    const restartGameEvent = new Event("restartGame");

    function clearGameboard() {
        _clearGamestate();
        while (gameboard.firstChild) {
            gameboard.firstChild.removeEventListener('click', _placeMarker);
            gameboard.removeChild(gameboard.firstChild);
        }
        render();
        dispatchEvent(restartGameEvent);
    }

    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", clearGameboard);

    function _clearGamestate() {
        gamestate.fill("", 0);
    }

    function _checkGamestate() {
        let winner;
        
        // Check for diagonal win
        if (gamestate[0] !== "" && gamestate[0] == gamestate[4] && gamestate[0] == gamestate[8]) {
            decideWinner(gamestate[0]);
        } else if (gamestate[2] !== "" && gamestate[2] == gamestate[4] && gamestate[0] == gamestate[6]) {
            decideWinner(gamestate[0]);
        }

        // Check for horizontal and vertical win
        for (let i = 0; i < 7; i++) {
            if (gamestate[i] == "") {
                continue;
            } else if (gamestate[i] == gamestate[i+1] && gamestate[i] == gamestate[i+2]) {
                decideWinner(gamestate[i]);
                break;
            } else if (gamestate[i] == gamestate[i+3] && gamestate[i] == gamestate[i+6]) {
                decideWinner(gamestate[i]);
                break;
            }
        }

        // If board is filled, declare a tie
        if (turnHandler.turnCount() == 9) {
            console.log("Tie!");
        }
    }

    function decideWinner(marker) {
        if (marker == player1.marker) {
            console.log(`${player1.name} wins!`)
        } else {
            console.log(`${player2.name} wins!`)
        }
    }

    return { render, clearGameboard };
})();

(function() {
    window.addEventListener("markerPlaced", turnHandler.changeTurn);

    window.addEventListener("markerPlaced", turnHandler.changeTurn);
    
    window.addEventListener("restartGame", turnHandler.resetTurns);
})();

gameboardHandler.render();