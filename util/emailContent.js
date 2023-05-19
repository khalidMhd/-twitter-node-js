exports.emailVerificatonContent = (token) => {
  const subject = "Email Verification";
  const html = `
        <p>Click on link to verify your account: <br>
        <a href="http://${process.env.HOST}/account/confirm/${token}">
        http://${process.env.HOST}/account/confirm/${token}</a> </p>
    `;
  return { subject, html };
};

exports.emailResetPasswordContent = (token) => {
  const subject = "Password Reset";
  const html = `<p>We received a request to reset the password for your account.</p>
          <p>To reset your password, Click the bellow link.</p> 
          <h5><a href="http://localhost:3000/reset/${token}">Clink me, to reset password</a></h5>`;
  return { subject, html };
};
