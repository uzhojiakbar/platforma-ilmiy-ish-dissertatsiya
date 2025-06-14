const isValidPhone = (phone) => {
    // raqam bunday formatda bolishi kerak: 998978222422
    return /^998\d{9}$/.test(phone);
};

const isValidPassword = (password) => {
    return password.length >= 6;
};

module.exports = {
  isValidPhone,
  isValidPassword,
};