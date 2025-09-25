export default function ResultBoard({trivias, userTriviaAnswers, handlePlayAgain}){
    let correctAnswers = 0;
    const triviaResults = trivias.map((trivia, triviaIndex) => {
        const correct = userTriviaAnswers[triviaIndex] === trivia.correctAnswer;
        if(correct){
            correctAnswers++;
        }
        return (
            <section className={`trivia-result`} key={triviaIndex}>
                <div className="question-info">
                    <div>{trivia.category}</div>
                    <div>{`Difficulty: ${trivia.difficulty}`}</div>
                </div>
                <div className="content">
                    <h3>{trivia.question}</h3>
                    {<div className="question-box">
                        <ul className="answers">
                            {trivia.shuffledAnswers.map((answer, answerIndex) => {
                                let icon;
                                if((answer === userTriviaAnswers[triviaIndex] && correct)|| (answer !== userTriviaAnswers[triviaIndex] && answer === trivia.correctAnswer)){
                                    icon = (<svg xmlns="http://www.w3.org/2000/svg" className="correct" viewBox="0 -960 960 960"><path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>)  
                                }else if(answer === userTriviaAnswers[triviaIndex] && !correct){
                                    icon = (<svg xmlns="http://www.w3.org/2000/svg" className="incorrect" viewBox="0 -960 960 960"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>)
                                }else{  
                                    icon = (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>) 
                                }
                                return (
                                    <li className="trivia-answer" key={answerIndex}>
                                        {icon}
                                        <div>{answer}</div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>}
                </div>
            </section>
            
        )
    });
    return (
        <section className="result-board">
            <div className="results-info">
                <h2>Results</h2>
                <p>{`${correctAnswers} / ${trivias.length}`}</p>
            </div>
            {triviaResults}
            <button onClick={handlePlayAgain} className="play-again">Play again</button>
        </section>
    )
}