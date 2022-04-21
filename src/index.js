import ObjectsToCsv from "objects-to-csv";
import puppeteer from "puppeteer";

// Declare variables
const userInput = process.argv[2];
const userValues = userInput.split(",");
const productsColes = [];
const currentDate = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "numeric",
  year: "numeric",
})
  .format(Date.now())
  .replaceAll("/", "-");
const filePath = `out/coles-data-${currentDate}.csv`;

/** Triggers a search for multiple products */
async function searchProducts() {
  const promises = userValues.map(async (userValue) => {
    const searchValue = userValue.trim();
    const productSearch = await searchProduct(searchValue);
    return productSearch;
  });
  await Promise.all(promises);
}

/**
 * Search for one product in a specific vendor
 * @param {string} userInput The value used in the search
 */
async function searchProduct(userInput) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const searchUrl = "https://shop.coles.com.au/a/national/everything/search";

  // Navigate to the search page
  await page.goto(`${searchUrl}/${encodeURI(userInput)}`, {
    waitUntil: "networkidle0",
  });

  // Extract product fields
  const productData = await page.evaluate(() => {
    return {
      brand: document.querySelector(".product-brand").innerHTML,
      name: document.querySelector(".product-name").innerHTML,
      priceDollar: document.querySelector(".price-container .dollar-value")
        .innerHTML,
      priceCent: document.querySelector(".price-container .cent-value")
        .innerHTML,
      quantity: document.querySelector(".product-info .package-size").innerHTML,
      package: document.querySelector(".product-info .package-price").innerHTML,
    };
  });

  // Transform data
  const transformedProductData = {
    searchValue: userInput,
    brand: productData.brand,
    name: productData.name,
    price: `${productData.priceDollar}${productData.priceCent}`,
    quantity: productData.quantity.toLowerCase().replace("approx.", "").trim(),
    packagePrice: productData.package.split("per")[0].replace("$", "").trim(),
    packageUnit: productData.package.split("per")[1].trim(),
  };

  productsColes.push(transformedProductData);

  await browser.close();
}

/** Generate a CSV file */
async function generateCsv() {
  const csv = new ObjectsToCsv(productsColes);
  await csv.toDisk(filePath);
}

// Run all functions
console.info(`⏳ Searching values, please wait...\n`);
await searchProducts();
await generateCsv();
console.info(`✅ File successfully generated at ${filePath}\n`);
