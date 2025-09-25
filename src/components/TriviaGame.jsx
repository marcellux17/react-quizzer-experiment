import { useEffect, useState } from "react";
import useTimer from "../hooks/useTimer";

const TIME_LIMIT_IN_MS = 10*1000;

export default function TriviaGame({trivias, handleOver, handleTriviaAnswered}){
    const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
    const [answerSelected, setAnswerSelected] = useState(null);

    const [timeRemaining] = useTimer(currentTriviaIndex, () => handleTriviaAnswered(answerSelected), TIME_LIMIT_IN_MS);
    
    const timeElapsed = TIME_LIMIT_IN_MS-timeRemaining;

    const currentTrivia = trivias[currentTriviaIndex];
    const questionBox = (
        <div className="question-box">
            <div className="answers">
                {currentTrivia.shuffledAnswers.map((answer, i) => {
                    return (
                        <div className="trivia-answer" key={i}>
                            <input type="radio" name="trivia-answer" id={answer} value={answer} checked={answerSelected === answer} onChange={handleAnswerChange} disabled={timeRemaining === 0}/>
                            <label htmlFor={answer}>{answer}</label>
                        </div>
                    )
                })}
            </div>
        </div>
    )
    
    useEffect(() => {
        setAnswerSelected(setInitialAnswerSelected());
    }, [currentTriviaIndex]);
    function handleAnswerChange(e){
        setAnswerSelected(e.target.value);
    }
    function setInitialAnswerSelected(){
        const currentTrivia = trivias[currentTriviaIndex];
        const index = Math.floor(Math.random()*currentTrivia.shuffledAnswers.length);
        return currentTrivia.shuffledAnswers[index];
    }
    return (  
        <section className="trivia-game-box">
            <div className="question-info">
                <div>{`${currentTrivia.category}`}</div>
                <div>{`Difficulty: ${currentTrivia.difficulty}`}</div>
                <div>{`${currentTriviaIndex+1}/${trivias.length}`}</div>
            </div>
            <div className="content">
                <h3>{currentTrivia.question}</h3>
                <div className="timer-box">
                    <div className="timer">{timeRemaining === 0 ? 0 : (timeRemaining/1000).toFixed(1)}</div>
                    <div className="timer-bar-container">
                        <div className="timer-bar" style={{
                            backgroundColor: timeElapsed/(TIME_LIMIT_IN_MS) > 0.8 ? "var(--color-danger)" : "var(--color-safe)",
                            width: `${timeElapsed*100/(TIME_LIMIT_IN_MS)}%`
                        }}></div>
                    </div>
                </div>
                { questionBox }
                <button className={timeRemaining === 0 ? "show-next-page" : "hidden show-next-page"} onClick={() => currentTriviaIndex === trivias.length-1 ? handleOver() : setCurrentTriviaIndex(prevIndex => prevIndex+1)}>
                    { currentTriviaIndex === trivias.length-1 ? "Show results" : "Answer next question"}
                </button>
            </div>
        </section>
    );
}
 