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

//convert string date to javascript date object
function checkExpirationDate (stringDate, dateNow) {
    // "stringDate" will be like this: '2014-04-03'
    const parts = stringDate.split('-');
    // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    const convertedDate = new Date(parts[0], parts[1] - 1, parts[2]); 
    return dateNow > convertedDate;
};

module.exports = {
    checkProductDiscounts,
    checkExpirationDate
}