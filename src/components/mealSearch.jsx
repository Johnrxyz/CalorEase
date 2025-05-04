//FOOD SEARCH PAGE
import { useState, useEffect } from "react";
import '../style/recipeSearchStyle.css'
import axios from "axios";
import RecipeCard from "./calorieInfo";


const PaginationMeals = ({totalPost, postPerPage, setCurrentPage}) => {
    let pages = []

    for(let i = 1; i <= Math.ceil(totalPost / postPerPage); i++){
        pages.push(i)
    }

    return(
        <div className="flex gap-3 justify-center mt-5">
            {pages.map((page, index) => {
                return(
                <button 
                    key={index} 
                    onClick={() => setCurrentPage(page)}
                    className="bg-green-400 text-white p-3 rounded-lg text-lg"
                >
                    {page}
                </button>)
            })}
        </div>
    );
}

// start
const SearchRecipe = () => {
    // hooks
    const [SearchInput, setSearchInput] = useState("")
    const [Recipes, setRecipes] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [postPerPage, setPostPerPage] = useState(8)


    // calculations
    const lastIndex = currentPage * postPerPage
    const startIndex = lastIndex - postPerPage
    const currentPost = Recipes.slice(startIndex, lastIndex)


    // handlers
    const formattedInput = (input) => {
        return input.trim().split(" ").join("+")
    }

    const FetchRecipe = async (query) => {

        if (!query) return; // returns when no input 
        
        const cacheKey = `recipe_${query.toLowerCase()}` // create a key
        const cached = localStorage.getItem(cacheKey) // access it to the local db to save api calls and prevent limits

        if (cached) {
            return setRecipes(JSON.parse(cached))
        }

        const formatInput = formattedInput(query)

        try {
            const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${formatInput}&includeNutrition=true&number=40&apiKey=${process.env.REACT_APP_API_KEY}`)

            setRecipes(response.data.results)
            localStorage.setItem(cacheKey, JSON.stringify(response.data.results))

        } catch (err) {
            console.error(`Opss.. Error there must have been a error in fetching the Data. \n ${err}`)
        }
    }

    // generate random recipe
    useEffect(() => {
        const RandomRecipe = async () => {
            try {
                // hours
                const ONE_DAY = 24 * 60 * 60 * 1000
                const now = Date.now()

                // store last fetched
                const lastFetched = parseInt(localStorage.getItem("random_last_fetched") || 0)
                // create or load the local storage 
                const stored = localStorage.getItem("random_recipe");

                if (stored && (now - lastFetched < ONE_DAY)) {
                    const parsed = JSON.parse(stored);
                    setRecipes(parsed);
                    console.log("recipe already stored")
                    console.log(parsed)
                    return;
                }

                // fetch the api 
                const response = await axios.get(`https://api.spoonacular.com/recipes/random?includeNutrition=true&number=31&apiKey=${process.env.REACT_APP_API_KEY}`)
                console.log(`recipe saved to the local storage...`, response.data.recipes)

                // append to the local storage
                setRecipes(response.data.recipes); // set to state

                // save to the local storage the loaded random recipes
                localStorage.setItem("random_recipe", JSON.stringify(response.data.recipes))
                localStorage.setItem("random_last_fetched", now.toString()) // set time


            } catch (ero) {
                console.error(`Error fetching api... ${ero}`)
            }
        };

        RandomRecipe();

    }, [])
    
    return (
        <div className="m-10">
            {/* search function */}
            <span className="flex">
                <input 
                type="text"
                value={SearchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="p-3 bg-gray-100 flex-1 outline-none"
                placeholder="Search Meal..."
                />

                <button className="p-3 bg-green-400 text-white"
                onClick={() => FetchRecipe(SearchInput)}>
                    Search
                </button>
            </span>

            {Recipes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
                    {currentPost.map((Meal,idx) => (
                        <RecipeCard image={Meal.image} name={Meal.title} key={Meal.id} id={Meal.id} idx={idx} />
                    ))}
                </div>
            )}

            <PaginationMeals totalPost={Recipes.length} postPerPage={postPerPage} setCurrentPage={setCurrentPage}/>

        </div>
    );
};

export default SearchRecipe;