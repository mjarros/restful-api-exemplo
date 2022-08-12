const transportador = require("./nodemailer");

const enviarEmail = (email, subject, text) => {
  transportador.sendMail({
    from: process.env.ENVIAR_EMAIL_FROM,
    to: email,
    subject: subject,
    text: text,
  });
};

module.exports = enviarEmail;
