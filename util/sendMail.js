const nodeMailer = require("nodemailer");

SMPT_SERVICE = "gmail";
SMPT_EMAIL = "";
SMPT_HOST = "smtp.gmail.com";
SMPT_PORT = 587;

const sendMail = async (email, html, subject) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: SMPT_HOST,
      port: SMPT_PORT,
      secure: false,
      requireTLS: true,
      service: SMPT_SERVICE,
      auth: {
        user: SMPT_EMAIL,
        pass: "",
      },
    });

    const mailOptions = {
      from: "",
      to: email,
      subject: subject,
      text: "Expert system",
      html: html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("result");
    return { result, success: true };
  } catch (error) {
    console.log("error");
    return { error, success: false };
  }
};

// sendMail("toraca7105@agrolivana.com", "html", "subject")
//   .then(data => console.log(data))
//   .catch(err => console.log(err))

module.exports = sendMail;
