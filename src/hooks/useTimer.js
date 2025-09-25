import { useEffect, useRef, useState } from "react";

export default function useTimer(effectDependency, onTimerEnd, timeInMs){
    const [timeRemaining, setTimeRemaining] = useState(0);
    const frameID = useRef(null);
    const onTimerEndRef = useRef();
    useEffect(() => {
        onTimerEndRef.current = onTimerEnd;
    }, [onTimerEnd])
    useEffect(() => {
        let countdownReference;
        requestAnimationFrame(firstFrame)
        function firstFrame(timeStamp){
            countdownReference = timeStamp;
            timer(timeStamp)
        }
        function timer(timeStamp){
            const timeElapsed = timeStamp-countdownReference;
            const timeRemaining = Math.max(timeInMs-timeElapsed, 0);
            setTimeRemaining(timeRemaining);
            if(timeRemaining == 0){
                onTimerEndRef.current();
                return;
            }
            frameID.current = requestAnimationFrame(timer)
        }
        return () => cancelAnimationFrame(frameID.current)
    }, [effectDependency]); 
    return [timeRemaining]
}