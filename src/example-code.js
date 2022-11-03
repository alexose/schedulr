const example1 = {
    name: "Example One: Puppeteer",
    content: `/*
 * Welcome to Schedulr!
 *
 * The code in this editor will be run on a timer in a NodeJS sandbox.
 * All you need to do is to export a single async function, and Schedulr
 * takes care of the rest.  The returned value will be stored as a time
 * series that you can explore later.
 *
 * The default sandbox includes several pre-installed packages.
 * The following example uses puppeteer to check the current price of a
 * Raspberry Pi 4 on Amazon.
 *
 */

const puppeteer = require("puppeteer");

module.exports = async function () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.amazon.com/dp/B07TC2BK1X");
    let price = await page.evaluate(() => {
        return ['.a-price-whole', '.a-price-fraction'].map((d) => {
            return parseInt(document.querySelectorAll(d)[0].innerText);
        }).join('.');
    });
    browser.close();
    return price;
}`,
};

const example2 = {
    name: "Example Two: Fetch",
    content: `/*
 * This example uses node-fetch to check a free API.  In this case, we're 
 * checking the weather in Jacksonville, Oregon via the weather.gov API. 
 *
 */

const fetch = require("node-fetch");
const url = "https://api.weather.gov/stations/kmfr/observations";

module.exports = async function () {
    const response = await fetch(url);
    return await response.text();
}`,
};

const example3 = {
    name: "Example Three: Google Flights",
    content: `/*
 * This example uses Puppeteer to check flight prices on Google Flights.
 *
 */

const puppeteer = require("puppeteer");

module.exports = async function () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.google.com/flights");
    page.keyboard.press("Tab");
    await page.type('nth-child(2)', 'Pizza Delivery');

    let price = await page.evaluate(() => {
        return ['.a-price-whole', '.a-price-fraction'].map((d) => {
            return parseInt(document.querySelectorAll(d)[0].innerText);
        }).join('.');
    });
    browser.close();
    return price;
}`,
};

module.exports = [example1, example2, example3];
