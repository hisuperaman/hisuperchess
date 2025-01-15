import { Chess } from "./chess.js"
import Player from "./player.js"

class ChessGame {
    constructor() {
        this.config = {
            draggable: true,
            position: 'start',
            dropOffBoard: 'trash',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onChange: this.onChange.bind(this)
        }

        this.gameStarted = false
        this.board = Chessboard('board', this.config)
        this.game = new Chess()
        this.winner = null

        this.board.position(this.game.fen())

        this.gameStarted = false

        this.mode = 'offline'

        this.maxTimer = timerInput.value * 60

        this.me = new Player('Me', 'w', this.maxTimer, myTimerText, myNameText)
        this.opponent = new Player('Opponent', 'b', this.maxTimer, opponentTimerText, opponentNameText)

        this.timerInterval = null

        this.socket = null
        this.roomId = null
        this.gameId = null
    }

    setPlayer(me, opponent) {
        this.me.id = me.id
        this.me.name = me.name
        this.me.color = me.color
        this.opponent.id = opponent.id
        this.opponent.name = opponent.name
        this.opponent.color = opponent.color

        this.me.updateName()
        this.opponent.updateName()

        this.board.orientation(this.me.color == 'w' ? 'white' : 'black')
    }

    onDragStart(source, piece, position, orientation) {
        if (!this.gameStarted || this.game.isGameOver()) return false

        if (this.mode == 'online') {
            if (
                (this.game._turn == 'w' && this.me.color == 'b') ||
                (this.game._turn == 'b' && this.me.color == 'w')
            ) {
                return false
            }
            if (
                (this.game._turn == 'w' && piece.startsWith('b')) ||
                (this.game._turn == 'b' && piece.startsWith('w'))
            ) {
                return false
            }
        }
        else {
            // offline pass n play
            if (
                (this.game._turn == 'w' && piece.startsWith('b')) ||
                (this.game._turn == 'b' && piece.startsWith('w'))
            ) {
                return false
            }
        }
    }

    onDrop(source, target, piece, newPos, oldPos, orientation) {
        try {
            const move = this.game.move({
                from: source,
                to: target,
                promotion: 'q'
            })

            if (this.mode == 'online') {
                this.socket.emit('movePiece', { move, roomId: this.roomId })
            }

            this.highlightTileAndBrightDimTimer(move)
        } catch (e) {
            if (e.message.includes(' move')) return 'snapback'
            console.error(e)
        }
    }

    onChange(oldPos, newPos) {
        this.updateStatus()
    }

    updateStatus() {
        let status = ''
        let moveColor = 'White'
        if (this.game.turn() == 'b') {
            moveColor = 'Black'
        }

        if (this.game.isCheckmate()) {
            status = `Game Over, ${moveColor} is in Checkmate`
            this.winner = moveColor === 'White' ? (this.me.color == 'w' ? this.opponent : this.me) : (this.me.color == 'b' ? this.opponent : this.me)

            if (this.mode == 'online') {
                this.socket.emit('checkmate', { roomId: this.roomId, gameId: this.gameId, winner: this.winner }, (response) => {
                    // console.log(response)
                })
            }
            this.stopTimer('Checkmate')
        }
        else if (this.me.timer == 0 || this.opponent.timer == 0) {
            if (this.me.timer == 0) {
                this.winner = this.opponent
            }
            else {
                this.winner = this.me
            }
            // handle on time win
            if (this.mode == 'online') {
                this.socket.emit('timeOut', { roomId: this.roomId, gameId: this.gameId, winner: this.winner }, (response) => {
                    // console.log(response)
                })
            }

            status = `Game Over, ${this.winner.color === 'w' ? 'White' : 'Black'} wins on time`
            this.stopTimer('on time')


        }
        else if (this.me.resigned || this.opponent.resigned) {
            this.winner = this.me.resigned ? this.opponent : this.me
            status = `Game Over, ${this.winner.color === 'w' ? 'Black' : 'White'} has resigned`
            this.stopTimer('on resignation')


        }
        else if (this.game.isDraw()) {
            status = `Game Over, Draw`
            this.winner = 'Draw'
            this.stopTimer('')


        } else {
            status = `${moveColor} to move`
            if (this.game.inCheck()) {
                status += `, ${moveColor} is in Check`
            }
        }

        document.getElementById('gameStatus').innerHTML = status
    }

    #enterFullScreen() {
        if (root.requestFullscreen) {
            root.requestFullscreen()
        } else if (root.webkitRequestFullscreen) {
            root.webkitRequestFullscreen()
        } else if (root.msRequestFullscreen) {
            root.msRequestFullscreen()
        }
    }

    startGame(mode, maxTimer, socket, roomId, gameId) {
        // Implement the logic to switch between offline and online modes
        root.scrollTo(0, 0)
        // console.log('Game started')
        root.style.overflow = 'hidden'

        // this.#enterFullScreen()

        this.resetGame()

        this.mode = mode
        this.maxTimer = maxTimer
        this.me.timer = maxTimer
        this.opponent.timer = maxTimer
        this.me.updateTimerUI()
        this.opponent.updateTimerUI()
        if (mode == 'online') {
            this.socket = socket
            this.roomId = roomId
            this.gameId = gameId
        }
        else {
            this.board.orientation('white')
            this.opponent.name = 'Opponent'
            this.opponent.updateName()
            this.me.color = 'w'
            this.opponent.color = 'b'

        }

        this.gameStarted = true

        if (this.game._turn == 'w') {
            this.me.brightTimerUI()
            this.opponent.dimTimerUI()
        }
        else {
            this.me.dimTimerUI()
            this.opponent.brightTimerUI()
        }

        this.updateTimer()
    }

    updateTimer() {
        this.timerInterval = setInterval(() => {
            if (this.game._turn == 'w') {
                if (this.me.color == 'w') {
                    this.me.timer--
                    this.me.updateTimerUI()
                }
                else {
                    this.opponent.timer--
                    this.opponent.updateTimerUI()
                }
            } else {
                if (this.me.color == 'b') {
                    this.me.timer--
                    this.me.updateTimerUI()
                }
                else {
                    this.opponent.timer--
                    this.opponent.updateTimerUI()
                }
            }

            if (this.me.timer == 0 || this.opponent.timer == 0) {
                clearInterval(this.timerInterval)
                if (this.me.timer == 0) {
                    this.winner = this.opponent
                }
                else if (this.opponent.timer == 0) {
                    this.winner = this.me
                }
                this.gameStarted = false
                this.updateStatus()
            }
        }, 1000);
    }

    resetGame() {
        this.game.reset()
        this.board.position(this.game.fen())

        this.gameStarted = false
        this.winner = null

        document.querySelectorAll('.square-55d63').forEach((sq) => {
            sq.classList.remove('highlight-white')
        })
        document.querySelectorAll('.square-55d63').forEach((sq) => {
            sq.classList.remove('highlight-black')
        })

        if (this.timerInterval) clearInterval(this.timerInterval)
        this.me.timer = this.maxTimer
        this.opponent.timer = this.maxTimer

        this.me.updateTimerUI()
        this.opponent.updateTimerUI()

        this.updateStatus()

        showBeforeGameControls()
    }

    stopTimer(reason) {
        root.style.overflow = 'auto'

        this.gameStarted = false
        clearInterval(this.timerInterval)


        showGameModal(this.winner === 'Draw' ? 'Draw' : (this.winner.color === 'b' ? 'Black won' : 'White won'), reason)
        showBeforeGameControls()
        this.opponent.reset(this.maxTimer)
        this.me.reset(this.maxTimer)
    }

    highlightTileAndBrightDimTimer(move) {
        if (move.color == 'w') {
            document.querySelectorAll('.square-55d63').forEach((sq) => {
                sq.classList.remove('highlight-white')
            })
            document.querySelector(`.square-${move.from}`).classList.add('highlight-white')
            document.querySelector(`.square-${move.to}`).classList.add('highlight-white')

            if (this.me.color == 'w') {
                this.me.dimTimerUI()
                this.opponent.brightTimerUI()
            }
            else {
                this.me.brightTimerUI()
                this.opponent.dimTimerUI()
            }
        } else {
            document.querySelectorAll('.square-55d63').forEach((sq) => {
                sq.classList.remove('highlight-black')
            })
            document.querySelector(`.square-${move.from}`).classList.add('highlight-black')
            document.querySelector(`.square-${move.to}`).classList.add('highlight-black')

            if (this.me.color == 'b') {
                this.me.dimTimerUI()
                this.opponent.brightTimerUI()
            }
            else {
                this.opponent.dimTimerUI()
                this.me.brightTimerUI()
            }
        }
    }
}



export default ChessGame