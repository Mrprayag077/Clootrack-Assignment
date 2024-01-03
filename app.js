// RESULTS: EXTRACTED DATA FROM MAGICPIN || STORED DATA TO MONGODB-ATLAS || AS PER DISHNAME
// https://github.com/Mrprayag077/Clootrack-Assignment


const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

(async () => {

    mongoose.set("strictQuery", false);

    // Define the schema for your MongoDB collection
    const Scrape_Schema = new mongoose.Schema({
        dishName: String,
        price: String,
        category: String,
    });

    // Create a Mongoose model
    const Dish = mongoose.model('Dish', Scrape_Schema);

    // Connect to MongoDB Atlas
    const MONGO_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tuna9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Puppeteer code to extract and store data
    const browser = await puppeteer.launch();

    // const browser = await puppeteer.launch({
    //     headless: false,
    //     args: [
    //         "--disable-gpu",
    //         "--disable-dev-shm-usage",
    //         "--disable-setuid-sandbox",
    //         "--no-sandbox",
    //     ],
    // });

    const page = await browser.newPage();
    await page.goto('https://magicpin.in/New-Delhi/Paharganj/Restaurant/Eatfit/store/61a193/delivery/');

    const categories = await page.$$eval('.categoryListing', (categoryElements) => {
        return categoryElements.map((categoryElement) => {
            const categoryName = categoryElement.querySelector('.categoryHeading').textContent.trim();
            const menuItems = Array.from(categoryElement.querySelectorAll('.itemInfo')).map((itemInfoElement) => {
                const dishName = itemInfoElement.querySelector('.itemName a').textContent.trim();
                const price = itemInfoElement.querySelector('.itemPrice').textContent.trim();
                return { dishName, price };
            });

            return { categoryName, menuItems };
        });
    });

    // Store data in MongoDB Atlas
    for (const category of categories) {
        for (const menuItem of category.menuItems) {
            const existingDish = await Dish.findOne({ dishName: menuItem.dishName });

            if (!existingDish) {
                const dishData = {
                    dishName: menuItem.dishName,
                    price: menuItem.price,
                    category: category.categoryName,
                };


                console.log("----------------------------------------------------");
                console.log(dishData);
                console.log("----------------------------------------------------");
                // Create a new document using the Mongoose model and save it to MongoDB Atlas
                await Dish.create(dishData);
            }

            else {
                console.log("----------------------------------------------------");
                console.log(menuItem.dishName + " " + menuItem.price + " " + category.categoryName);
                console.log("----------------------------------------------------");

            }
        }

    }

    // Close Puppeteer, disconnect from MongoDB Atlas
    await browser.close();
    await mongoose.disconnect();
})();
