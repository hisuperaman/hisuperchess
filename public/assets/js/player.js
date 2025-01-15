class Player {
    constructor(name, color, timer, timerTextElement, nameTextElement) {
        this.id = null
        this.name = name
        this.color = color
        this.timer = timer
        this.resigned = false
        this.timerTextElement = timerTextElement
        this.nameTextElement = nameTextElement
    }

    updateName() {
        this.nameTextElement.innerHTML = this.name
    }

    updateTimerUI() {
        const minutes = Math.floor(this.timer / 60)
        const seconds = this.timer % 60
        this.timerTextElement.innerHTML = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    dimTimerUI() {
        if(this.timerTextElement.style.opacity != 0.6) {
            this.timerTextElement.style.opacity = 0.6
        }
    }

    brightTimerUI() {
        if(this.timerTextElement.style.opacity == 0.6) {
            this.timerTextElement.style.opacity = 1
        }
    }


    reset(timer) {
        this.timer = timer
        this.resigned = false
    }
}

export default Player