export class ProductColes {
  constructor(userInput, productData) {
    this.market = "Coles";
    this.searchValue = userInput;
    this.brand = productData.brand;
    this.name = productData.name;
    this.price = `${productData.priceDollar}${productData.priceCent}`;
    this.quantity = productData.quantity
      .toLowerCase()
      .replace("approx.", "")
      .trim();
    this.packagePrice = productData.package.includes("per")
      ? productData?.package.split("per")[0].replace("$", "").trim()
      : "Not Available";
    this.packageUnit = productData.package.includes("per")
      ? productData?.package.split("per")[1].trim()
      : "Not Available";
    this.url = productData.url;
  }
}

export class ProductWoolworths {
  constructor(userInput, productData) {
    this.market = "Woolworths";
    this.searchValue = userInput;
    this.brand = productData.brand || "Not Available";
    this.name = productData.name || "Not Available";
    this.price =
      productData.priceDollar && productData.priceCent
        ? `${productData.priceDollar}.${productData.priceCent}`
        : "Not Available";
    this.quantity = "Not Available";
    this.packagePrice = productData.package
      ? productData.package.split("/")[0].replace("$", "").trim()
      : "Not Available";
    this.packageUnit = productData.package
      ? productData.package.split("/")[1].trim()
      : "Not Available";
    this.url = productData.url;
  }
}

export class ProductHarrisFarm {
  constructor(userInput, productData) {
    this.market = "Harris Farm";
    this.searchValue = userInput;
    this.brand = productData.brand || "Not Available";
    this.name = productData.name.trim();
    this.price = productData.price.replace("$", "").trim();
    this.quantity = productData.quantity;
    this.packagePrice = productData.package.includes("per")
      ? productData.package.split("per")[0].replace("$", "").trim()
      : productData.package.split(" ")[0].replace("$", "").trim();
    this.packageUnit = productData.package.includes("per")
      ? productData.package.split("per")[1].trim()
      : productData.package.split(" ")[1].trim();
    this.url = productData.url;
  }
}
