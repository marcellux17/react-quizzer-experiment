import { useEffect } from "react";

export default function ErrorMessage({message, setError}){
    useEffect(() => {
        setTimeout(() => {
            setError(prevError => ({...prevError, shown: false}))
        }, (1500));
    }, []);
    return (
        <div className={`error-message`} onClick={() => setError(prevError => ({...prevError, shown: false}))}>
            { message }
        </div>
    );
}