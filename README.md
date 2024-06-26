# Schedulr

Run code in the cloud. Store the results. Get alerted if you want. Designed to run on a single micro instance.

Based on [InfluxDB](https://github.com/influxdata/influxdb), [Bull](https://github.com/OptimalBits/bull), and [Express.js](https://github.com/expressjs/express).

NOTE: This should by no means be used in production. It's just a little tool I wrote on a Sunday afternoon.

Schedulr is primarily useful for web scraping, although it can be used anywhere you may need to get a value and store it
for future analysis.

## Getting started

    git clone https://github.com/alexose/schedulr.git
    cd schedulr
    npm install
    cp config.js.example config.js
    <edit config.js as you see fit>
    npm run serve 

## Usage

The atomic unit of Schedulr is called a Job. At minimum, a Job has two attributes:

`code`: The javascript code to be run. The `return` value determines the value to be stored. You can access the previous
value via the special tag `{{last}}`.

`frequency`: The frequency at which the code should be run, for example '1m' or '4h'. This uses
[parse-duration](https://www.npmjs.com/package/parse-duration) under the hood.

TODO: Alerts

## Why not just use Lambda, Cloudflare Workers, Google Cloud Run, etc.?

There are a lot of ways to send arbitrary code to the cloud and return a result. However, I've found that the ability to
schedule tasks and store their results involes using their clunky UIs. Furthermore, they tend to have opaque billing
strategies that make it hard to determine costs ahead of time.

In the future, I may add the ability to use one of these services as a backend, but for now I'm keeping Schedulr as
simple as I can.

## API Documentation

-   `GET /job`

Gets a full list of jobs.

-   `GET /job/:id`

Gets a specific job and its results. By default, this will be limited to the last 1000 results.

-   `POST /job`

Create a new job.

```
{
    code: "return {{last}} + 1",
    frequency: "1m",
}
```

-   `PUT /job/:id`

Edit a job.

You can put a job on a hold like so:

```
{
    pause: true
}
```

-   `DELETE /job/:id`

Remove a job and all data associated with it.

### Examples

    const puppeteer = require("puppeteer");

    module.exports = async function () {
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
        return urls;
    }
