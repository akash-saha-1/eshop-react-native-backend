const nodemailer = require('nodemailer');

const sendEmail = (toAddress, subject, body) => {
  const mailService = process.env.MAIL_SERVICE;
  const mailHost = process.env.MAIL_HOST;
  const mailAddress = process.env.MAIL_ADDRESS;
  const mailPassword = process.env.MAIL_PASSWORD;

  if (!subject || subject == '') {
    subject = 'Successfull User Registration in Easy Shop Application';
  }

  if (!body || body == '') {
    body =
      'Congratulations! Your profile is successfully registered in Easy Shop Application. Please Login to place your order.';
  }

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
    subject: subject,
    text: body,
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
