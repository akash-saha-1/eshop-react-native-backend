const nodemailer = require('nodemailer');

const sendEmail = (toAddress) => {
  const mailService = process.env.MAIL_SERVICE;
  const mailHost = process.env.MAIL_HOST;
  const mailAddress = process.env.MAIL_ADDRESS;
  const mailPassword = process.env.MAIL_PASSWORD;

  let mailTransporter = nodemailer.createTransport({
    service: mailService,
    host: mailHost,
    auth: {
      user: mailAddress,
      pass: mailPassword,
    },
  });

  let mailDetails = {
    from: mailAddress,
    to: toAddress,
    subject: 'Successfull User Registration in E-Shop Application',
    text: 'Congratulations! Your profile is successfully registered in E-Shop Application. Please Login to place your order.',
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log('Error Occurs while sending email due to : ' + err);
    } else {
      console.log('Email sent successfully');
    }
  });
};

module.exports = sendEmail;
