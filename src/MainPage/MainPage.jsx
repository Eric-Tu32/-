import React, { useState, useRef, useEffect } from "react";
import "./MainPage.css";

import TimerModal from "./Modal";
import alarm from "../assets/alarm.mp3"

const MainPage = () => {
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
    const seconds = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

    const [currentMinute, setCurrentMinute] = useState(0);
    const [currentSecond, setCurrentSecond] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isCanceled, setIsCanceled] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    // Separate refs for each picker
    const minutePickerRef = useRef(null);
    const secondPickerRef = useRef(null);
    const intervalRef = useRef(null); // Store the interval ID

    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    // Start the timer and show the modal
    const handleStart = () => {
        const totalTimeInSeconds = currentMinute * 60 + currentSecond; // Convert to seconds
        setRemainingTime(totalTimeInSeconds);
        setIsModalOpen(true);
        setIsPaused(false);
        startTimer();
    };

    // Handle Pause/Start toggle
    const handlePauseStartToggle = () => {
        setIsPaused(!isPaused);
        if (!isPaused) pauseTimer();
        else startTimer();
    };

    // Start the timer
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setRemainingTime((prevTime) => prevTime - 1);
            }, 1000);
        }
    };

    // Pause the timer
    const pauseTimer = () => {
        setIsRunning(false);
        clearInterval(intervalRef.current); // Clear the interval
        intervalRef.current = null; // Reset the interval ID
    };

    const resetPauseTimer = () => {
        setIsPaused(true);
        setIsRunning(false);
        clearInterval(intervalRef.current); // Clear the interval
        intervalRef.current = null; // Reset the interval ID
        setRemainingTime(currentMinute * 60 + currentSecond)
    }

    // Clear the interval on unmount
    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    // Stop the timer when it reaches 0
    useEffect(() => {
        if (remainingTime <= 0 && isRunning) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsModalOpen(false)
            playSound()
            setIsCanceled(false);
        }
    }, [remainingTime]);

    // Handle Cancel (Stop the countdown)
    const handleCancel = () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsModalOpen(false)
        setRemainingTime(0); // Reset the remaining time
    };

    const playSound = () => {
        const audio = new Audio(alarm);
        audio.play();
    };

    const handleScroll = (type, delta) => {
        if (type === "minutes") {
            setCurrentMinute((prev) => Math.min(Math.max(prev + delta, 0), minutes.length - 1));
        } else if (type === "seconds") {
            setCurrentSecond((prev) => Math.min(Math.max(prev + delta, 0), seconds.length - 1));
        }
    };

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e, type) => {
        touchEndY.current = e.touches[0].clientY;
        const deltaY = touchStartY.current - touchEndY.current;

        if (Math.abs(deltaY) > 20) {
            const delta = deltaY > 0 ? 1 : -1;
            handleScroll(type, delta);
            touchStartY.current = touchEndY.current; // Update start to avoid repeated scrolling
        }
        e.preventDefault(); // Prevent page scrolling
    };

    useEffect(() => {
        const addListeners = (pickerRef, type) => {
        const picker = pickerRef.current;

        const onTouchStart = (e) => handleTouchStart(e);
        const onTouchMove = (e) => handleTouchMove(e, type);

        picker.addEventListener("touchstart", onTouchStart, { passive: false });
        picker.addEventListener("touchmove", onTouchMove, { passive: false });

        return () => {
            picker.removeEventListener("touchstart", onTouchStart);
            picker.removeEventListener("touchmove", onTouchMove);
        };
        };

        const removeMinuteListeners = addListeners(minutePickerRef, "minutes");
        const removeSecondListeners = addListeners(secondPickerRef, "seconds");

        return () => {
            removeMinuteListeners();
            removeSecondListeners();
        };
    }, []);

    const handleHotkey = (minute, second) => {
        setCurrentMinute(minute);
        setCurrentSecond(second);
    }

    return (
        <div className="main-container">
            <div className="title-bar">
                球隊計時器
            </div>
            <div className="time-selector">
                <div className="picker-text">
                    剩
                </div>
                {/* Minute Picker */}
                <div
                    className="picker"
                    ref={minutePickerRef}
                >
                    <div className="highlight"></div>
                    <ul style={{ transform: `translateY(${-60 * currentMinute}px)` }}>
                    <li className="hidden">--</li>
                    {minutes.map((minute, index) => (
                        <li key={index} className={currentMinute === index ? "active" : ""}>
                        {minute}
                        </li>
                    ))}
                    <li className="hidden">--</li>
                    </ul>
                </div>
                <div className="picker-text">
                    分
                </div>
                {/* Second Picker */}
                <div
                    className="picker"
                    ref={secondPickerRef}
                >
                    <div className="highlight"></div>
                    <ul style={{ transform: `translateY(${-60 * currentSecond}px)` }}>
                    <li className="hidden">--</li>
                    {seconds.map((second, index) => (
                        <li key={index} className={currentSecond === index ? "active" : ""}>
                        {second}
                        </li>
                    ))}
                    <li className="hidden">--</li>
                    </ul>
                </div>
                <div className="picker-text">
                    秒
                </div>
            </div>
            <div className="btn-container">
                <button className="green-btn" onClick={handleStart}>開始</button>
            </div>
            <TimerModal is_on={isModalOpen} toggle={handleCancel} handlePauseStart={handlePauseStartToggle} reset={resetPauseTimer} isPaused={isPaused} remainingTime={remainingTime}/>
            <div className="hotkey-container">
                <div className="hotkey-text">
                    快捷鍵
                </div>
                <div className="hotkey-btn-container">
                    <button className="hotkey-btn" onClick={() => handleHotkey(1, 0)}>1:00</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(1, 30)}>1:30</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(2, 0)}>2:00</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(2, 30)}>2:30</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(3, 0)}>3:00</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(5, 0)}>5:00</button>
                </div>
                <div className="hotkey-btn-container">
                    <button className="hotkey-btn" onClick={() => handleHotkey(6, 0)}>6:00</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(7, 0)}>7:00</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(7, 30)}>7:30</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(8, 0)}>8:00</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(8, 30)}>8:30</button>
                    <button className="hotkey-btn" onClick={() => handleHotkey(10, 0)}>10:00</button>
                </div>
            </div>
        </div>
        
    );
};

export default MainPage;
