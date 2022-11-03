const puppeteer = require("puppeteer");

const origin = process.argv[2] || "SEA";
const destination = process.argv[3] || "CDG";

let result = [];

go();
async function go() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const today = new Date();
    await page.goto("https://www.google.com/flights");
    await shortDelay();
    await page.keyboard.down("Shift");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.up("Shift");
    await shortDelay();
    await page.keyboard.press("Enter"); // Select one-way
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await shortDelay();

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter"); // Select business
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.type(origin);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.keyboard.type(destination);
    await page.keyboard.press("Enter");
    await shortDelay();
    await page.keyboard.press("Enter");
    await shortDelay();
    await page.waitForXPath("//*[text() = 'Price graph']");

    page.on("response", handlePriceGraph);

    const elements = await page.$x("//*[text() = 'Price graph']");
    elements[0].click();

    // Scroll through next 8 months worth of data
    for (let i = 0; i <= 8; i++) {
        await longDelay();
        await page.click('button[aria-label="Scroll forward"]');
    }

    await longDelay();

    const sorted = result.sort((a, b) => {
        if (a[1] > b[1]) return 1;
        else if (a[1] < b[1]) return -1;
        else return 0;
    });

    console.log(sorted[0][1]);
    browser.close();
}

async function handlePriceGraph(resp) {
    const request = resp.request();
    if (request.url().includes("GetCalendarGraph")) {
        const text = await resp.text();

        // Not sure what this format is, exactly... maybe protobuf?
        const line = text.split("\n")[3];
        const a1 = JSON.parse(line);
        const a2 = JSON.parse(a1[0][2])[1];
        const a3 = a2.map(d => [d[0], d[2]?.[0]?.[1]]);

        result = result.concat(a3);
    }
}

function shortDelay() {
    return delay(Math.floor(Math.random() * 1200) + 700);
}

function longDelay() {
    return delay(Math.floor(Math.random() * 5000) + 1800);
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
