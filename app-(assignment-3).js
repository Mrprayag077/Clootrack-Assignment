// RESULTS: EXTRACTED DATA FROM MAGICPIN || STORED DATA TO CSV || CHECKED UNIQUE DATA
// https://github.com/Mrprayag077/Clootrack-Assignment



const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dotenv = require("dotenv");
dotenv.config();

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://magicpin.in/New-Delhi/Paharganj/Restaurant/Eatfit/store/61a193/delivery/');

    const categories = await page.$$eval('.categoryListing', (categoryElements) => {
        return categoryElements.map((categoryElement) => {
            const categoryName = categoryElement.querySelector('.categoryHeading').textContent.trim();
            const menuItems = Array.from(categoryElement.querySelectorAll('.itemInfo')).map((itemInfoElement) => {

                const dishNameElement = itemInfoElement.querySelector('.itemName a');
                const dishName = dishNameElement ? dishNameElement.textContent.trim() : '';
                console.log('HTML of dishNameElement:', dishNameElement ? dishNameElement.outerHTML : 'Not found');
                const price = itemInfoElement.querySelector('.itemPrice').textContent.trim();
                return { dishName, price, category: categoryName };
            });

            return menuItems;
        });
    });

    // Maintain a list of unique dish names
    const uniqueDishNames = new Set();

    // Store data in CSV file
    const csvWriter = createCsvWriter({
        path: 'output.csv',
        header: [
            { id: 'dishName', title: 'Dish Name' },
            { id: 'price', title: 'Price' },
            { id: 'category', title: 'Category' },
        ],
        append: true,
    });

    for (const menuItems of categories) {
        for (const menuItem of menuItems) {
            if (!uniqueDishNames.has(menuItem.dishName)) {
                console.log("----------------------------------------------------");
                console.log(menuItem);
                console.log("----------------------------------------------------");

                // Append the data to the CSV file
                await csvWriter.writeRecords([menuItem]);

                // Add the dish name to the set
                uniqueDishNames.add(menuItem.dishName);
            } else {
                console.log("data already exists: " + menuItem.dishName);
                console.log("----------------------------------------------------");
            }
        }
    }

    // Close Puppeteer
    await browser.close();
})();
