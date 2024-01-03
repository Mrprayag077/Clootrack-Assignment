const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

puppeteer.use(pluginStealth());

const luminatiApiToken = '06966b29-b7df-4b0e-9772-18b3594b9254';


async function scrapePage(page, url) {
    try {
        await page.goto(url);

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
                // const existingDish = await Dish.findOne({ dishName: menuItem.dishName });

                // if (!existingDish) {
                //     const dishData = { dishName: menuItem.dishName, price: menuItem.price, category: category.categoryName };
                //     await Dish.create(dishData);
                // } else {
                //     // Handle duplicate dish here
                // }

                console.log("----------------------------------------------------");
                console.log(menuItem.dishName + " " + menuItem.price + " " + category.categoryName);
                console.log("----------------------------------------------------");

            }
        }

        console.log('Data scraped from', url);
    } catch (error) {
        console.error('Error scraping page:', error);
        // Handle errors appropriately
    }
}

async function main() {
    // Connect to MongoDB Atlas
    // await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

    const pagesToScrape = [
        'https://magicpin.in/New-Delhi/Paharganj/Restaurant/Eatfit/store/61a193/delivery/',
        // ... More URLs
    ];

    let currentProxy = null;

    for (const url of pagesToScrape) {
        try {
            // Get a new proxy if needed
            if (!currentProxy) {
                const response = await axios.get('https://luminati.io/api/proxy', {
                    auth: { username: luminatiApiToken, password: '' },
                });
                currentProxy = `http://${response.data.proxy_address}:${response.data.ports[0]}@${response.data.username}:${response.data.password}`;
            }

            const browser = await puppeteer.launch({ headless: true, args: [`--proxy-server=${currentProxy}`] });
            const page = await browser.newPage();

            await scrapePage(page, url);

            await browser.close();
            currentProxy = null; // Invalidate proxy for next iteration
        } catch (error) {
            console.error('Error during scraping:', error);
            // Implement error handling and potential retry logic
        }
    }

    // Disconnect from MongoDB Atlas
    await mongoose.disconnect();
}

main();