import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = "https://v2.jokeapi.dev/joke/";

// Middleware
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: false }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Route to render the home page and fetch a joke
app.get('/', async (req, res) => {
    // Retrieve query parameters
    const categories = req.query.categories || [];
    const blacklists = req.query.blacklist || [];
    
    // Ensure categories and blacklists are arrays
    const selectedCategories = Array.isArray(categories) ? categories : [categories];
    const selectedBlacklists = Array.isArray(blacklists) ? blacklists : [blacklists];

    const blacklistsQuery = selectedBlacklists.join(",");
    
    // If no categories are selected, use "Any"
    if (selectedCategories.length === 0) {
        selectedCategories.push("Any");
    }

    try {
        // Fetch jokes from all selected categories
        const jokes = [];
        for (const category of selectedCategories) {
            const url = `${API_URL}${category}?blacklistFlags=${blacklistsQuery}&lang=en`;
            const response = await axios.get(url);
            const jokeData = response.data;

            // Prepare the joke content
            let jokeContent;
            if (jokeData.type === "single") {
                jokeContent = jokeData.joke; 
            } else if (jokeData.type === "twopart") {
                jokeContent = `${jokeData.setup} - ${jokeData.delivery}`; 
            } else {
                continue; 
            }

            jokes.push(jokeContent);
        }

        // Randomly pick one joke from the fetched jokes
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)] || "No jokes available. Try again!";

        // Render the EJS template with the joke and selections
        res.render("index", {
            joke: randomJoke,
            categories: selectedCategories,
            blacklists: selectedBlacklists
        });
    } catch (error) {
        console.error("Error fetching joke:", error);
        res.render("index", {
            joke: "Oops! Something went wrong while fetching the joke. Please try again later.",
            categories: selectedCategories,
            blacklists: selectedBlacklists
        });
    }
});

app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`);
});
