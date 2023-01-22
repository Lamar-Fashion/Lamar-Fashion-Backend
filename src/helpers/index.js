//get product price including all available discounts.
function checkProductDiscounts (price, isLoggedIn, signInDiscount, productDiscount) {
    price = Number(price);
    signInDiscount = Number(signInDiscount);
    productDiscount = Number(productDiscount);
    
    let totalDiscountPercentage = 0;
    //check signing-in discount
    if (isLoggedIn && signInDiscount) {
        totalDiscountPercentage = signInDiscount;
    }
    //check product discount (for on sales products)
    if (productDiscount) {
        totalDiscountPercentage = totalDiscountPercentage + productDiscount;
    }
    const newPrice = (price*(100 - totalDiscountPercentage))/100;
    return newPrice;
};
  
module.exports = {
    checkProductDiscounts
}