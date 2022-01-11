
const nodemailer = require("nodemailer");


const username = 'linkingsa1c@gmail.com';
const password = 'gr1c2021';
const hostname= "Gmail";

 

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: username,
    pass: password,
  },
});
module.exports.sendConfirmationEmail = (name:string, email:string, confirmationCode:string) => {
    transport.sendMail({
      from: username,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:3000/auth/confirm/${confirmationCode}> Click here</a>
          </div>`,
    });
  };
