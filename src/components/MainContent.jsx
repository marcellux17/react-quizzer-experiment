import { useEffect, useState, useRef } from "react";
import Form from "./Form"
import TriviaGame from "./TriviaGame";
import ResultBoard from "./ResultBoard";
import ErrorMessage from "./ErrorMessage";

const RATE_LIMIT_IN_SEC = 5.1;//opentriviadb has a 5 sec limit
const TOKEN_EXPIRY_IN_HOURS = 6;
async function requestSessionToken(){
    const res = await fetch("https://opentdb.com/api_token.php?command=request");
    const data = await res.json();
    return data.token;
}
async function delay(delayTime){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delayTime);
    })
}
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}
function buildURL(triviaConfig, token){
    let url = `https://opentdb.com/api.php?amount=${triviaConfig.numberOfQuestions}`;
    if(triviaConfig.category !== "any"){
        url += `&category=${triviaConfig.category}`;
    }
    if(triviaConfig.difficulty !== "any"){
        url += `&difficulty=${triviaConfig.difficulty}`;
    }
    if(triviaConfig.type !== "any"){
        url += `&type=${triviaConfig.type}`;
    }
    url += `&token=${token}&encode=url3986`;
    return url;
}
export default function MainContent(){
    const [error, setError] = useState({message: "", shown: false});
    const [trivias, setTrivias] = useState(null);
    const [gameState, setGameState] = useState("select");//select, going, over
    const [triviaConfig, setTriviaConfig] = useState({
        category: "any",
        difficulty: "any",
        type: "any",
        numberOfQuestions: 5
    });
    const [userTriviaAnswers, setUserTriviaAnswers] = useState([]);
    const [token, setToken] = useState(null);
    const isFetchingQuestions = useRef(false);

    useEffect(() => {
        const storageItem = JSON.parse(localStorage.getItem("react-quiz-experiment-trivia-token"));
        if(storageItem && Date.now() < storageItem.expiry){
            setToken(storageItem.token);
        }else{
            requestSessionToken().then(newToken => {
                setToken(newToken);
            })
        }
    }, []);

    useEffect(() => {
        const storageItem = JSON.stringify({token: token, expiry: Date.now()+TOKEN_EXPIRY_IN_HOURS*60*60*1000})
        localStorage.setItem("react-quiz-experiment-trivia-token", storageItem);
    }, [token]);

    async function startGame(triviaConfig, token){
        if(isFetchingQuestions.current)return;
        isFetchingQuestions.current = true;
        const url = buildURL(triviaConfig, token);
        try{
            const res = await fetch(url);
            const data = await res.json();
            switch(data.response_code){
                case 0:{
                    if(data.results.length === 0)throw new Error("No questions with defined parameters.");
                    setTriviaConfig({
                        category: decodeURIComponent(data.results[0].category),
                        type: decodeURIComponent(data.results[0].type),
                        difficulty: decodeURIComponent(data.results[0].difficulty)
                    })
                    setTrivias(data.results.map(trivia => {
                        const answers = [...trivia.incorrect_answers.map(a => decodeURIComponent(a)), decodeURIComponent(trivia.correct_answer)];
                        shuffle(answers);
                        return {
                            difficulty: decodeURIComponent(trivia.difficulty),
                            type: decodeURIComponent(trivia.type),
                            category: decodeURIComponent(trivia.category),
                            question: decodeURIComponent(trivia.question),
                            correctAnswer: decodeURIComponent(trivia.correct_answer),
                            shuffledAnswers: answers
                        }
                    }));
                    isFetchingQuestions.current = false;
                    setGameState("going");
                    break;
                }
                case 1: {
                    isFetchingQuestions.current = false;
                    throw new Error("No questions with defined parameters");
                }
                case 2: {
                    isFetchingQuestions.current = false;
                    throw new Error("Invalid parameters set.");
                }
                case 3:
                case 4:{
                    //token not found, token empty(all questions have been requested with the token)
                    setError({message: `Problem with session token. Trying request ${Math.floor(RATE_LIMIT_IN_SEC)} seconds later.`, shown: true});
                    await delay(RATE_LIMIT_IN_SEC*1000)
                    isFetchingQuestions.current = false;
                    const newToken = await requestSessionToken();
                    setToken(newToken);
                    startGame(triviaConfig, newToken);
                    break;
                }    
                case 5:{ 
                    //rate limiting
                    await delay(RATE_LIMIT_IN_SEC*1000);
                    isFetchingQuestions.current = false;
                    startGame(triviaConfig, token);
                    break;
                }
            }
        }catch(e){
            setError({message: `${e.message} Trying request ${RATE_LIMIT_IN_SEC} seconds later.`, shown: true});
            await delay(RATE_LIMIT_IN_SEC*1000);
            isFetchingQuestions.current = false;
        }
    }
    function handleTriviaAnswered(answer){
        setUserTriviaAnswers(prevTriviaAnswers => {
            return [...prevTriviaAnswers, answer];
        })
    }
    function handleOver(){
        setGameState("over");
    }
    function handlePlayAgain(){
        setGameState("select");
        setTriviaConfig({
            category: "any",
            difficulty: "any",
            type: "any",
            numberOfQuestions: 5
        })
        setTrivias([]);
        setUserTriviaAnswers([]);
    }
    return (
        <main>
            <h1>Quizzer</h1>
            {error.shown && <ErrorMessage message={error.message} setError={setError}></ErrorMessage>}

            {gameState === "select" && <Form handleSubmit={() => startGame(triviaConfig, token)} setTriviaConfig={setTriviaConfig} triviaConfig={triviaConfig}></Form>}
            {gameState === "going" && <TriviaGame trivias={trivias} handleOver={handleOver} handleTriviaAnswered={handleTriviaAnswered}></TriviaGame>}
            {gameState === "over" && <ResultBoard userTriviaAnswers={userTriviaAnswers} trivias={trivias} handlePlayAgain={handlePlayAgain}></ResultBoard>}
        </main>
    )
}