import { createSpinner } from "nanospinner";
import ObjectsToCsv from "objects-to-csv";
import puppeteer from "puppeteer";
import { ProductColes, ProductWoolworths } from "./schema.js";

// Declare constant variables
const markets = [
  {
    id: "coles",
    url: "https://shop.coles.com.au/a/national/everything/search/",
  },
  {
    id: "woolworths",
    url: "https://woolworths.com.au/shop/search/products?searchTerm=",
  },
  {
    id: "harrisFarm",
    url: "https://harrisfarm.com.au/search?q=",
  },
];

// Configure Puppeteer
const puppeteerOptions = {
  headless: false,
  args: [`--window-size=1920,1080`],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
};

// Declare variables
const userInput = process.argv[2] || "";
const userValues = userInput.split(",");
// const products = [];
const productsColes = [];
const productsWoolworths = [];
const currentDate = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "numeric",
  year: "numeric",
})
  .format(Date.now())
  .replaceAll("/", "-");
const filePath = `out/products-data-${currentDate}.csv`;

const searchMarket = (market, product) =>
  `${markets[market].url}${encodeURI(product)}`;

/** Triggers a search for multiple products */
async function searchProducts() {
  const searching = userValues.map(async (userValue) => {
    const searchValue = userValue.trim();
    const coles = await searchColes(searchValue);
    const woolworths = await searchWoolworths(searchValue);
    return Promise.all([coles, woolworths]);
  });
  await Promise.all(searching);
}

/**
 * Search for one product in a specific vendor
 * @param {string} userInput The value used in the search
 */
async function searchColes(userInput) {
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();

  // Navigate to the search page
  await page.goto(searchMarket(0, userInput));
  await page.waitForSelector("header.product-header", {
    visible: true,
  });

  // Extract product fields
  const productData = await page.evaluate(() => {
    const querySelect = (selectors) => {
      if (!selectors || !document.querySelector(selectors))
        return "Not Available";
      return document.querySelector(selectors).innerHTML;
    };

    return {
      brand: querySelect(".product-brand"),
      name: querySelect(".product-name"),
      priceDollar: querySelect(".price-container .dollar-value"),
      priceCent: querySelect(".price-container .cent-value"),
      quantity: querySelect(".product-info .package-size"),
      package: querySelect(".product-info .package-price"),
    };
  });

  // Transform data
  const transformedProductData = new ProductColes(userInput, productData);
  productsColes.push(transformedProductData);

  await browser.close();
}

const searchWoolworths = async (userInput) => {
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();

  await page.goto(searchMarket(1, userInput));

  await page.waitForSelector("shared-product-tile", {
    visible: true,
  });

  // Execute code in the DOM
  const productData = await page.evaluate(() => {
    const querySelect = (selectors) => {
      if (!selectors || !document.querySelector(selectors)) return "";
      return document.querySelector(selectors).innerHTML;
    };
    // const productTile = document.querySelector("shared-product-tile");
    return {
      brand: "",
      name: querySelect(".shelfProductTile-descriptionLink"),
      priceDollar: querySelect("shared-price .price-dollars"),
      priceCent: querySelect("shared-price .price-cents"),
      quantity: "",
      package: querySelect(
        ".shelfProductTile-information .shelfProductTile-cupPrice"
      ),
    };
  });

  const transformedProductData = new ProductWoolworths(userInput, productData);
  productsWoolworths.push(transformedProductData);

  await browser.close();

  return productsWoolworths;
};

/** Generate a CSV file */
async function generateCsv() {
  const products = [...productsColes, ...productsWoolworths];
  const csv = new ObjectsToCsv(products);
  await csv.toDisk(filePath);
}

// Run all functions
const spinner = createSpinner("Searching markets, please wait...").start();
await searchProducts();
await generateCsv();
spinner.success({ text: `File successfully generated at ${filePath}` });

console.table(productsColes);
console.table(productsWoolworths);

// const products = Array.from(headers).map((v) => v.innerHTML);

// const data = await page.evaluate(() => {
//   const productTile = document.querySelectorAll("shared-product-tile");
//   const productData = [];
//   productTile.forEach((product) => {
//     productData.push({});
//   });

//   // const headers = document.querySelectorAll("shared-product-tile header a");
//   // const pricesDollar = document.querySelectorAll(
//   //   "shared-price .price-dollars"
//   // );
//   // const pricesCents = document.querySelectorAll("shared-price .price-cents");

//   // const urls = Array.from(headers).map((v) => v.innerHTML);
//   // const pricesText = Array.from(pricesDollar).map((v) => v.innerHTML);
//   // const pricesCentsText = Array.from(pricesCents).map((v) => v.innerHTML);

//   return productData;
// });
