const playerFactory = function(name, marker) {
    this.name = name;
    this.marker = marker;
    return { name, marker }
}

var player1 = playerFactory("Player 1", "X");
var player2 = playerFactory("Player 2", "O");

// Handles player renaming
(function() {
    const playerRenameInputFields = document.querySelectorAll(".player-rename-input");
    
    // window[element.id.substring(0, 7)] returns 
    // the player number for that input field
    // i.e. first input field is for renaming player1
    playerRenameInputFields.forEach(element => element.placeholder = window[element.id.substring(0, 7)].name);
    playerRenameInputFields.forEach(element => element.addEventListener("focusout", updatePlayer));

    // Updates player name to the input then 
    // clears input field
    function updatePlayer(e) {
        if (e.target.value) {
            window[e.target.id.substring(0, 7)].name = e.target.value;
        }
        e.target.value = "";
        e.target.placeholder = window[e.target.id.substring(0, 7)].name;
    }
})();

// Stores and updates turn order
const turnHandler = (function() {
    let currentPlayer = player1;
    let turnCounter = 1;

    function changeTurn() {
        currentPlayer === player1 ? currentPlayer = player2 : currentPlayer = player1;
        turnCounter++;
        messageHandler.displayMessage(`It is currently ${currentPlayer.name}'s turn.`)
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

// Stores, updates, and checks current gamestate,
// renders gameboard
const gameboardHandler = (function() {
    let gamestate = new Array(9);
    gamestate.fill("", 0);

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
            dispatchEvent(markerPlacedEvent);
            _checkGamestate();
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
        messageHandler.displayMessage(`It is currently ${turnHandler.currentTurn().name}'s turn.`);
    }

    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", clearGameboard);

    function _clearGamestate() {
        gamestate.fill("", 0);
    }

    function _checkGamestate() {        
        // Checks for diagonal win
        if (gamestate[0] !== "" && gamestate[0] == gamestate[4] && gamestate[0] == gamestate[8]) {
            _decideWinner(gamestate[0]);
            return;
        } else if (gamestate[2] !== "" && gamestate[2] == gamestate[4] && gamestate[2] == gamestate[6]) {
            _decideWinner(gamestate[2]);
            return;
        }

        // Checks for horizontal win
        for (let i = 0; i < 7; i += 3) {
            if (gamestate[i] == "") {
                continue;
            } else if (gamestate[i] == gamestate[i+1] && gamestate[i] == gamestate[i+2]) {
                _decideWinner(gamestate[i]);
                return;
            }
        }
        
        // Checks for vertical win
        for (let i = 0; i < 3; i++) {
            if (gamestate[i] == "") {
                continue;
            } else if (gamestate[i] == gamestate[i+3] && gamestate[i] == gamestate[i+6]) {
                _decideWinner(gamestate[i]);
                return;
            }
        }

        // If board is filled, declares a tie
        if (turnHandler.turnCount() == 10) {
            messageHandler.displayMessage(`It's a tie!`)
        }
    }

    function _decideWinner(marker) {
        _freezeMarkerPlacement();
        if (marker == player1.marker) {
            messageHandler.displayMessage(`Congratulations! ${player1.name} wins!`);
        } else {
            messageHandler.displayMessage(`Congratulations! ${player2.name} wins!`);
        }
    }

    function _freezeMarkerPlacement() {
        let gameboardSquares = document.querySelectorAll(".gameboard-square");
        gameboardSquares.forEach(element => element.removeEventListener('click', _placeMarker));
    }

    return { render, clearGameboard };
})();

// Updates the message container
const messageHandler = (function(){
    const messageContainer = document.querySelector(".message-container");

    function displayMessage(message) {
        messageContainer.innerText = message;
    }
    
    return { displayMessage }
})();

// Binds global event listeners
(function() {
    window.addEventListener("markerPlaced", turnHandler.changeTurn);
    
    window.addEventListener("restartGame", turnHandler.resetTurns);
})();

gameboardHandler.render();