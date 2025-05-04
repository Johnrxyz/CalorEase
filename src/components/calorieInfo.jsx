//FOOD CARD
import axios from "axios";
import { useState } from "react";
import '../style/modal.css'


const RecipeCard = ({name, image, id, idx}) => {

    const [showModal, setShowModal] = useState(false);
    const [recipeInfo, setRecipeInfo] = useState(null);

    const ViewRecipe = async (id) => {

        const cachedData = localStorage.getItem("CachedRecipe")
        var cachedRecipe = cachedData ? JSON.parse(cachedData) : []

        const existingIndex = cachedRecipe.findIndex(item => item.data.id === id);

        if (existingIndex !== -1) {
            setRecipeInfo(cachedRecipe[existingIndex].data);
            setShowModal(true);
            console.log("Loaded from cache:", cachedRecipe[existingIndex].data);
            return;
        }
        try {
            const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${process.env.REACT_APP_API_KEY}`)
            setRecipeInfo(response.data)
            setShowModal(true)
            console.log(response.data)

            const newCache = {  
                data: response.data,
                fetchedAt: new Date().toLocaleDateString(),
            };

            cachedRecipe.push(newCache)
            localStorage.setItem("CachedRecipe", JSON.stringify(cachedRecipe));
            
        } catch (err) {
            console.error(`Error fetching the recipe data... ${err}`)
        }        
    }

    const AddtoCalorie = async (id) => {
        const cacheKey = `cachedkey_${id}`;
        const cachedRecipe = localStorage.getItem(cacheKey);
        let parsedRecipeData = null

        // fetch the data
        if (cachedRecipe) {
            parsedRecipeData = JSON.parse(cachedRecipe).data;
        } else {
            try {
                const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${process.env.REACT_APP_API_KEY}`)
                parsedRecipeData = response.data

                const dataToCache = {
                    data: response.data,
                    fetchedAt: Date.now()
                };
                localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

            } catch (err) {
                console.error(`Failed to fetch api data... ${err}`)
            }
        }
        
        const caloricBreakdown = parsedRecipeData.nutrition.caloricBreakdown;
    
        const FoodNutritionData = {
            id: parsedRecipeData.id,
            name: parsedRecipeData.title,
            protein: caloricBreakdown.percentProtein,
            fat: caloricBreakdown.percentFat,
            carbs: caloricBreakdown.percentCarbs,
        };
    
        console.log(FoodNutritionData);
    
        const CalorieDatas = localStorage.getItem("CalorieData");
        const parsedCalorieData = CalorieDatas ? JSON.parse(CalorieDatas) : [];
        
        const checkAlreadyExist = parsedCalorieData.some(item => item.id === FoodNutritionData.id)

        if (checkAlreadyExist) {
            console.log("This item already exist in your db", checkAlreadyExist)
            return
        }

        parsedCalorieData.push(FoodNutritionData);
        localStorage.setItem("CalorieData", JSON.stringify(parsedCalorieData));
        alert("added to my calorie...")
    };
    

    // return
    return(
        <div>
            <div className="flex flex-col justify-between shadow-lg rounded overflow-hidden h-[350px] w-full max-w-sm">
                <img
                    src={image}
                    alt={name}
                    onError={(err) => {
                    err.target.onerror = null;
                    err.target.src = "https://placehold.co/600x400";
                    console.log(`This image has error: ${name}`);
                    }}
                    className="h-48 w-full object-cover"
                />

                <div className="flex flex-col justify-between flex-grow px-5 py-4">
                    <h2 className="text-xl mb-2 text-start">{name}</h2>
                    
                    <span className="flex justify-between">
                        <button className="bg-blue-500 text-white px-1 py-2 rounded">
                            Add to Tracker ✅
                        </button>

                        <button className="bg-green-500 text-white px-1 py-2 rounded" onClick={() => ViewRecipe(id)}>
                            View 🔎
                        </button>
                    </span>
                </div> 

            </div>

            {showModal && recipeInfo && (
                <div className="modal-overlay">
                    {/* close btn */}
                    <button className="close text-2xl text-white" onClick={() => setShowModal(false)}>X</button> 

                    <div className="modal-content">
                        {/* modal content */}
                        <div className="max-w-xl mx-auto p-4">
                            <img src={recipeInfo.image} alt={recipeInfo.title} className="w-fit h-auto rounded-lg shadow-md"/>
                        </div>

                        <h1 className="text-2xl font-bold">{recipeInfo.title}</h1>

                    </div>
                </div>
            )}
        </div>
        
    );
};

export default RecipeCard;