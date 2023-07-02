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
    let newPrice = (price*(100 - totalDiscountPercentage))/100;
    newPrice = Math.floor(newPrice / 5) * 5; //round price to near lowest five.
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

//generate order summary message
function generateOrderSummaryMessage (order) {
    const personalInfo = order.personalInfo;
    const productInfo = order.productInfo;
    // let summary = `Hi ${personalInfo.Fname ?? '' } ${personalInfo.Lname ?? ''},\n\nThank you for your recent purchase from Lamar Fashion. We are pleased to confirm your order. Here's a summary of your order:\n\nProduct(s) Ordered:\n\n`;

    // // Loop over the products and concatenate the code and quantity to the string
    // for (let i = 0; i < productInfo.length; i++) {
    //     summary += `- Product Code: ${productInfo[i].code}, Size: ${productInfo[i].size}, Quantity: ${productInfo[i].quantity}, Original Price: ${productInfo[i].price} QAR\n`;
    //     summary += `Product Link: ${process.env.Website_URL}/ProductDetails/${productInfo[i].id}\n\n`;
    // }
    
    // // Add the total price to the string
    // summary += `\nTotal Price: ${order.totalPrice} QAR`;
    
    // // Add the contact details to the string
    // summary += `\n\nWe'll use the phone number (${personalInfo.phone}) and email (${personalInfo.email}) you provided to get in touch.`;

    // summary += `\n\nOrder will be shipped to:`;
    // summary += `\n${personalInfo.FlatNumber} [Building No.], ${personalInfo.StreetAddress} [Street], ${personalInfo.Zone}, ${personalInfo.city}, ${personalInfo.country}.`;

    // summary+= `\n\nIf you have any questions or concerns about your order, please don't hesitate to contact us. We're always here to help!\n\nThanks again for choosing our brand. We hope to see you again soon.\n\nBest regards,\n\nLamar Fashion Team.\n`;

    // // Add the contact details to the string
    // summary += `Phone: ${process.env.LAMAR_Phone_Number}\nEmail: ${process.env.NODE_MAILER_EMAIL_SENDER}`;

    // return summary;

    let products = "";
    for (let i = 0; i < productInfo.length; i++) {
        products += `- Product Code: ${productInfo[i].code}, Size: ${productInfo[i].size}, Quantity: ${productInfo[i].quantity}, Original Price: ${productInfo[i].price} QAR\n`;
        products += `Product Link: ${process.env.Website_URL}/ProductDetails/${productInfo[i].id}\n\n`;
    };

    let summary = `Hi ${personalInfo.Fname || '' + personalInfo.Lname || ''},\n\nThank you for your recent purchase from Lamar Fashion.\nWe are pleased to confirm your order.\n\nHere's a summary of your order:\n\nProduct(s) Ordered:\n\n${products}Total Price: ${order.totalPrice} QAR.\n\nWe'll use this phone number ${personalInfo.phone} and email ${personalInfo.email} you provided to get in touch.\nOrder will be shipped to: ${personalInfo.FlatNumber + " [Building No.], " + personalInfo.StreetAddress + " [Street], " + personalInfo.Zone + ", " + personalInfo.city + ", " + personalInfo.country + "."} soon.\n\nIf you have any questions or concerns about your order, please don't hesitate to contact us. We're always here to help!\n\nThanks again for choosing our brand.\nWe hope to see you again soon.\n\nBest regards,\nLamar Fashion Team.\nPhone: ${personalInfo.LAMAR_Phone_Number}\nEmail: ${process.env.NODE_MAILER_EMAIL_SENDER}\n\n**NOTE: This Whatsapp number used only for notifying you when your order successfully completed. so please don't reply to this chat, but reach out to our phone number instead: ${personalInfo.LAMAR_Phone_Number}.`;
    
    //Whatsapp Template:
    // Hi {{1}},\n\nThank you for your recent purchase from Lamar Fashion.\nWe are pleased to confirm your order.\n\nHere's a summary of your order:\n\nProduct(s) Ordered:\n\n{{2}}Total Price: {{3}} QAR.\n\nWe'll use this phone number {{4}} and email {{5}} you provided to get in touch.\nOrder will be shipped to: {{6}} soon.\n\nIf you have any questions or concerns about your order, please don't hesitate to contact us. We're always here to help!\n\nThanks again for choosing our brand.\nWe hope to see you again soon.\n\nBest regards,\nLamar Fashion Team.\nPhone: {{7}}\nEmail: {{8}}\n\n**NOTE: This Whatsapp number used only for notifying you when your order successfully completed. so please don't reply to this chat, but reach out to our phone number instead: {{7}}.

    return summary;
};

//generate order summary message as HTML
function generateOrderSummaryHTMLMessage (order) {
    const personalInfo = order.personalInfo;
    const productInfo = order.productInfo;
    let summary = `<h4>Hi ${personalInfo.Fname ?? '' } ${personalInfo.Lname ?? ''}</h4>`;

    summary += `<br/>`;

    summary += `<p>Thank you for your recent purchase from Lamar Fashion. We are pleased to confirm your order. Here's a summary of your order:</p>`;

    summary += `<br/>`;
    
    summary += `<p>Product(s) Ordered:</p>`;

    summary += `<br/>`;

    // Loop over the products and concatenate the code and quantity to the string
    for (let i = 0; i < productInfo.length; i++) {
        summary += `<p>${i+1}- Product Code: ${productInfo[i].code}, Size: ${productInfo[i].size}, Quantity: ${productInfo[i].quantity}, Original Price: ${productInfo[i].price} QAR</p>`;
        summary += `<p>Product Link: ${process.env.Website_URL}/ProductDetails/${productInfo[i].id}</p>`;
        summary += `<img src="${productInfo[i].images[0]}" style="max-width: 350px; max-height: 450px" alt="product_image2" />`;
        summary += `<br/>`;
    }
    
    // Add the total price to the string
    summary += `<h3>Total Price: ${order.totalPrice} QAR</h3>`;

    summary += `<br/>`;
    
    // Add the contact details to the string
    summary += `<p>We'll use the phone number (${personalInfo.phone}) and email (${personalInfo.email}) you provided to get in touch.</p>`;

    summary += `<br/>`;

    summary += `<p>Order will be shipped to:</p>`;
    summary += `<p>${personalInfo.FlatNumber} [Building No.], ${personalInfo.StreetAddress} [Street], ${personalInfo.Zone}, ${personalInfo.city}, ${personalInfo.country}.</p>`;

    summary += `<br/>`;

    summary+= `<p>If you have any questions or concerns about your order, please don't hesitate to contact us. We're always here to help!</p>`;
    
    summary += `<br/>`;

    summary+= `<p>Thanks again for choosing our brand. We hope to see you again soon.</p>`;
    
    summary += `<br/>`;

    summary+= `<p>Best regards,</p>`;

    summary += `<br/>`;

    summary+= `<h3>Lamar Fashion Team.</h3>`;
  

    // Add the contact details to the string
    summary += `<p>Phone: ${process.env.LAMAR_Phone_Number}</p>`;
    summary += `<p>Email: ${process.env.NODE_MAILER_EMAIL_SENDER}</p>`;

    return summary;
};

//generate notification for wishlist becomes available message
function generateWishlistAvailableMessage (product) {

    let summary = `Great news!\n\nYour wishlist product "${product.code}" is now available. Check Abaya in our website ${process.env.Website_URL}/ProductDetails/${product.id} to purchase it before it's gone.\n\nThank you for choosing our store!\n\nLamar Fashion Team.\nPhone: ${process.env.LAMAR_Phone_Number}\nEmail: ${process.env.NODE_MAILER_EMAIL_SENDER}`;

    //Whatsapp Template
    // Great news!\n\nYour wishlist product "{{1}}" is now available. Check Abaya in our website {{2}}/ProductDetails/{{3}} to purchase it before it's gone.\n\nThank you for choosing our store!\n\nLamar Fashion Team.\nPhone: {{4}}\nEmail: {{5}}


    return summary;
};

//generate notification for wishlist becomes available message as HTML
function generateWishlistAvailableHTMLMessage (product) {
    let summary = `<h2>Great news!</h2>`;

     summary += `<p>Your wishlist product "${product.code}" is now available.</p>`;

     summary += `<img src="${product.images[0]}" alt="product_image" /> <br/>`;
     
     summary += `<p>Check Abaya in our website ${process.env.Website_URL}/ProductDetails/${product.id} to purchase it before it's gone. </p> <br/>`; 

    summary+= `<p>Thank you for choosing our store!</p> <br/>`;

    summary+= `<h3>Lamar Fashion Team.</h3>`;

    // Add the contact details to the string
    summary += `<p>Phone: ${process.env.LAMAR_Phone_Number}</p>`;
    summary += `<p> Email: ${process.env.NODE_MAILER_EMAIL_SENDER}</p>`;

    return summary;
};

module.exports = {
    checkProductDiscounts,
    checkExpirationDate,
    generateOrderSummaryMessage,
    generateWishlistAvailableMessage,
    generateWishlistAvailableHTMLMessage,
    generateOrderSummaryHTMLMessage
}