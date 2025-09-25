import { useEffect, useState } from "react";
async function fetchCategories(){
    try{
        const categoriesRes = await fetch("https://opentdb.com/api_category.php");
        const categoriesData = await categoriesRes.json();
        const categories = categoriesData.trivia_categories.map(async (category) => {
            const categoryRes = await fetch(`https://opentdb.com/api_count.php?category=${category.id}`)
            const categoryData = await categoryRes.json();
            return {
                id: category.id,
                name: category.name,
                questionCount: {
                    easy: categoryData.category_question_count.total_easy_question_count,
                    medium: categoryData.category_question_count.total_medium_question_count,
                    hard: categoryData.category_question_count.total_hard_question_count
                }
            };
        })
        const categoryValues = await Promise.all(categories);
        const categoriesObj = Object.fromEntries(
            categoryValues.map(cv => {
                return [cv.id, cv]
            })
        )
        return categoriesObj;
    }catch{
        return null;
    }
}
export default function Form({handleSubmit, setTriviaConfig, triviaConfig}){
    const [categories, setCategories] = useState(null);
    
    useEffect(() => {
        fetchCategories().then(categories => {
            setCategories(categories);
        }).catch(() => {
            setCategories(null)
        })
    }, [])
    function onSubmit(e){
        e.preventDefault();
        handleSubmit();
    }
    if(categories){
        const maxQuestionCount = triviaConfig.category === "any" || triviaConfig.difficulty === "any"? 10:categories[triviaConfig.category].questionCount[triviaConfig.difficulty];
        return (
            <form onSubmit={onSubmit} className="trivia-config-form">
                <div className="form-field">
                    <label htmlFor="category">Category</label>
                    <select name="categories" id="category" value={triviaConfig.category} onChange={(e) =>setTriviaConfig(prevConfig => ({...prevConfig,category: e.target.value}))}>
                        <option value="any">Any category</option>
                        {
                            Object.keys(categories).map(categoryId => {
                                return <option value={categoryId} key={categoryId}>{categories[categoryId].name}</option>
                            })
                        }
                    </select>
                </div>
                <div className="form-field">
                    <label htmlFor="difficulty">Difficulty</label>
                    <select name="difficulty" id="difficulty" value={triviaConfig.difficulty} onChange={(e) => setTriviaConfig(prevConfig => ({...prevConfig, difficulty: e.target.value}))}>
                        <option value="any">Any difficulty</option>
                        <option value="medium">Medium</option>
                        <option value="easy">Easy</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div className="form-field">
                    <label htmlFor="number-of-questions" >Number of questions</label>
                    <input type="number" id="number-of-questions" value={triviaConfig.numberOfQuestions} min={1} max={maxQuestionCount < 50 ? maxQuestionCount: 50}
                        onChange={(e) => setTriviaConfig(prevConfig => ({...prevConfig, numberOfQuestions: e.target.value}))}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="type">Type</label>
                    <select name="type" id="type" value={triviaConfig.type} onChange={(e) => setTriviaConfig(prevConfig => ({...prevConfig, type: e.target.value}))}>
                        <option value="any">Any type</option>
                        <option value="multiple">Multiple choice</option>
                        <option value="boolean">True / False</option>
                    </select>
                </div>
                <button type="submit" className="play">Play</button>
            </form>
        )
    }
    return (
        <div>
            loading categories...
        </div>
    )
}