import ChessGame from "./ChessGame.js"
import socket from "./socket.js"


const chessGame = new ChessGame()

passPlayButton.addEventListener('click', handlePassPlay)

function handlePassPlay() {
    chessGame.startGame('offline', chessGame.maxTimer)

    showAfterGameControls()
}


function handleTimerChange(e, newTimer) {
    currentTimerText.innerHTML = newTimer + ' min'
    timerInput.value = newTimer

    document.querySelectorAll('.activeTimer').forEach((timerItem) => {
        timerItem.classList.remove('activeTimer')
    })

    e.currentTarget.classList.add('activeTimer')

    chessGame.maxTimer = newTimer * 60

    chessGame.me.timer = chessGame.maxTimer
    chessGame.opponent.timer = chessGame.maxTimer
    chessGame.me.updateTimerUI()
    chessGame.opponent.updateTimerUI()
}

window.handleTimerChange = handleTimerChange

function handleResignClick(e) {
    e.stopPropagation()

    chessGame.gameStarted = false

    if (chessGame.mode == 'online') {
        chessGame.me.resigned = true

        socket.emit('resignGame', { gameId: chessGame.gameId, roomId: chessGame.roomId, resignedPlayer: chessGame.me.resigned ? chessGame.me : chessGame.opponent }, (response) => {
            // console.log(response)
        })
    }
    else {
        // console.log('asjdflk')
        // pass n play
        if (chessGame.game._turn == 'w') {
            chessGame.me.resigned = true
        }
        else {
            chessGame.opponent.resigned = true
        }
    }

    

    chessGame.updateStatus()

    showBeforeGameControls()
}

window.handleResignClick = handleResignClick

function closeGameModal() {
    gameModal.style.display = 'none'
}



window.closeGameModal = closeGameModal

document.addEventListener('click', (e) => {
    if (gameModal.style.display == 'flex' && !gameModal.contains(e.target)) {
        closeGameModal()
    }
})

window.addEventListener('resize', () => {
    chessGame.board.resize()
})

let cancelTimer = null

async function handleHostClick() {
    socket.emit('hostGameRoom', { timer: chessGame.maxTimer }, (response) => {
        if (response.status != 'ok') {
            return
        }
        const data = response

        let waitTime = data.waitTime
        cancelButtonCancelTimer.innerHTML = getFormattedTimerFromSeconds(waitTime)
        cancelTimer = setInterval(() => {
            cancelButtonCancelTimer.innerHTML = getFormattedTimerFromSeconds(waitTime)
            waitTime -= 1

            if (waitTime == 0) {
                clearInterval(cancelTimer)
                showUIAfterCancelHostClick()
            }
        }, 1000);

        roomId.value = data.roomId
        hideUIAfterHostClick()
    })

}

window.handleHostClick = handleHostClick

async function handleCancelHostClick() {
    socket.emit('hostGameRoom', { timer: chessGame.maxTimer }, (response) => {
        if (response.status != 'ok') {
            return
        }
        const data = response

        clearInterval(cancelTimer)
        showUIAfterCancelHostClick()
    })

}

window.handleCancelHostClick = handleCancelHostClick



async function handleJoinClick() {
    if (roomId.value.length != 6) {
        alert('Invalid Room ID')
        return;
    }

    socket.emit('joinGameRoom', { roomId: roomId.value }, (response) => {
        // console.log(response)
    })


    // hideUIAfterHostClick()
}

window.handleJoinClick = handleJoinClick




// socket events
socket.on('playerJoined', (data) => {
    // console.log('joined')
    socket.emit('startGame', { roomId: roomId.value, timer: chessGame.maxTimer })
})

socket.on('startGame', (data) => {
    const me = socket.id == data.whitePlayer.id ? data.whitePlayer : data.blackPlayer
    const opponent = socket.id == data.whitePlayer.id ? data.blackPlayer : data.whitePlayer
    me.color = socket.id == data.whitePlayer.id ? 'w' : 'b'
    opponent.color = me.color == 'w' ? 'b' : 'w'

    chessGame.setPlayer(me, opponent)
    chessGame.startGame('online', data.maxTimer, socket, roomId.value, data.gameId)


    clearInterval(cancelTimer)
    showUIAfterCancelHostClick()

    showAfterGameControls()
})

socket.on('resignGame', (data) => {
    if (chessGame.opponent.id == data.resignedPlayer.id) {
        chessGame.gameStarted = false
        chessGame.opponent.resigned = true
        chessGame.updateStatus()
        showBeforeGameControls()

    }
    leaveRoom()
})

function leaveRoom() {
    socket.emit('leaveRoom', { roomId: chessGame.roomId }, (response) => {
        // console.log('left room')
    })
}

socket.on('timeOut', (data) => {
    leaveRoom()
})

socket.on('checkmate', (data) => {
    leaveRoom()
})


socket.on('movePiece', (data) => {
    // chessGame.board.position(data.move.after, false)
    chessGame.board.move(`${data.move.from}-${data.move.to}`)
    chessGame.highlightTileAndBrightDimTimer(data.move)
    chessGame.game.load(data.move.after)

    chessGame.updateStatus()
    // console.log(chessGame.game._turn)
})