function showAfterGameControls() {
    beforeStartControls.style.display = 'none'
    afterStartControls.style.display = 'flex'
}
function showBeforeGameControls() {
    beforeStartControls.style.display = 'flex'
    afterStartControls.style.display = 'none'
}

function showGameModal(title, subtitle) {
    gameModalResultText.innerHTML = title
    gameModalResultReasonText.innerHTML = subtitle
    gameModal.style.display = 'flex'
}


function hideUIAfterHostClick() {
    joinButton.style.display = 'none'
    passPlayButton.style.display = 'none'
    hostButton.style.display = 'none'
    cancelButton.style.display = 'flex'
    timerSelectorButton.style.display = 'none'
    timerSelector.style.display = 'none'
    roomId.readOnly = true
}

function showUIAfterCancelHostClick() {
    joinButton.style.display = 'flex'
    passPlayButton.style.display = 'flex'
    hostButton.style.display = 'flex'
    cancelButton.style.display = 'flex'
    timerSelectorButton.style.display = 'flex'
    // timerSelector.style.display = 'flex'
    roomId.readOnly = false
    roomId.value = ''
    cancelButton.style.display = 'none'
}

function getFormattedTimerFromSeconds(timer) {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}