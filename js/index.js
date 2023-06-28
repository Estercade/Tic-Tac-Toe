const playerFactory = function(name, marker) {
    this.name = name;
    this.marker = marker;
    return { name, marker }
}

const gameboardHandler = (function() {
    let gamestate = ["X", "O", "X", "O", "X", "O", "X", "O", "X"];

    const gameboard = document.getElementById("gameboard");
    const template = document.getElementById("gameboard-square-template");

    function render() {
        for (let i = 0; i < gamestate.length; i++) {
            let clone = template.content.cloneNode(true);
            let li = clone.querySelector("li");
            li.innerText = gamestate[i];
            _attachListener(li);
            gameboard.append(clone);
        }
    }

    function _attachListener(gameboardSquare) {
        gameboardSquare.addEventListener('click', _placeMarker);
    }

    const event = new Event("markerPlaced");

    function _placeMarker(e) {
        if (e.target.innerText !== "") {
            console.log("That square is not empty!");
        } else {
            dispatchEvent(event);
        }
    }

    function clearGameboard() {
        _clearGamestate();
        while (gameboard.firstChild) {
            gameboard.firstChild.removeEventListener('click', _placeMarker);
            gameboard.removeChild(gameboard.firstChild);
        }
        render();
    }

    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", clearGameboard);

    function _clearGamestate() {
        gamestate.fill("", 0);
        console.log(gamestate);
    }

    return { render, clearGameboard };
})();

const turnHandler = (function() {
    function marker() {
        console.log("Marker has been placed.");
    }

    return { marker };
})();

gameboardHandler.render();

(function() {
    window.addEventListener("markerPlaced", turnHandler.marker);
})();