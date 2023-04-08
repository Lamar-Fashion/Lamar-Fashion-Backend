"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function nodemailerCaller(messageObj, emailsArray) {
    //create transporter object
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODE_MAILER_EMAIL_SENDER,
            pass: process.env.NODE_MAILER_PASS_SENDER
        }
    });
    //TODO:
    //use lamar email.
    //for this email: "Info@lamarfashion.qa"

    //   let transporter = nodemailer.createTransport({
    //     host: 'your_smtp_host',
    //     port: 465, // or your SMTP port
    //     secure: true,
    //     auth: {
    //       user: 'your_email_address',
    //       pass: 'your_email_password'
    //     }
    //   });
    const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL_SENDER, // sender address
        to: emailsArray.join() , // list of receivers "bar@example.com, baz@example.com"
        subject: messageObj.subject, // Subject line
        // text: "message", // plain text body
        // html: "<b>Hello world?</b>", // html body
    };

    if (messageObj.html) {
        mailOptions.html = messageObj.html;
    } else {
        mailOptions.text = messageObj.text;
    }

  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId);

};

module.exports = {
    nodemailerCaller
}