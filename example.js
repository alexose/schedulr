const puppeteer = require("puppeteer");

async function go() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://news.ycombinator.com/");
    let urls = await page.evaluate(() => {
        let results = [];
        let items = document.querySelectorAll("a.titlelink");
        items.forEach(item => {
            results.push({
                url: item.getAttribute("href"),
                text: item.innerText,
            });
        });
        return results;
    });
    browser.close();
    console.log(urls);
}

go();
