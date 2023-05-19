exports.emailValidatoin = (email) => {
  const emailValidation = /\S+@\S+\.\S+/;
  return emailValidation.test(String(email));
};

exports.passwordValidation = (password) => {
  return String(password).length >= 5 ? true : false;
};
