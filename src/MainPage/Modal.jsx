import "./Modal.css"

export default function TimerModal({ is_on, toggle, handlePauseStart, isPaused, remainingTime}) {
    if (!is_on) return
    

    // Format remaining time in MM:SS
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="timer-modal-container">
            <div className="modal-body">
                {formatTime(remainingTime)}
            </div>
            <div className="modal-btns">
                <button onClick={toggle} className='red-btn'>取消</button>
                {isPaused ? (
                    <button onClick={handlePauseStart} className='resume-btn'>繼續</button>
                ) : (
                    <button onClick={handlePauseStart} className='red-btn'>暫停</button>
                )}
            </div>
        </div>
    )
}