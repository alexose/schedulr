module.exports = `/*
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
}`;
