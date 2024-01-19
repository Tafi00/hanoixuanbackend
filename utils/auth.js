const jwt = require("jsonwebtoken");
const axios = require("axios");
const zaloOa = require("../zalo-oa.json");
function generateRandomOTP() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Tạo mới token cho người dùng
 * @param {Object} user - Đối tượng người dùng
 * @returns {Object} - Đối tượng chứa access token và refresh token
 */
function generateTokens(user) {
  const payload = {
    name: user.name,
    userId: user.userId,
    phone: user.phone,
  };
  const accessTokenSecret = process.env.ACCESSTOKEN_SECRET;
  const refreshTokenSecret = process.env.REFRESH_SECRET;

  const accessTokenOptions = {
    expiresIn: process.env.ACCESSTOKEN_EXP,
  };
  const refreshTokenOptions = {
    expiresIn: process.env.REFRESHTOKEN_EXP,
  };
  const accessToken = jwt.sign(payload, accessTokenSecret, accessTokenOptions);

  const refreshToken = jwt.sign(
    payload,
    refreshTokenSecret,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
}

/**
 * Giải mã token để lấy thông tin người dùng
 * @param {string} token - Token cần được giải mã
 * @returns {Object} - Thông tin của người dùng
 */
function decodeToken(token) {
  const secretKey = process.env.ACCESSTOKEN_SECRET;
  return jwt.verify(token, secretKey);
}

function sendZNS(phone, otp) {
  let data = JSON.stringify({
    phone: phone,
    template_id: "256588",
    template_data: {
      otp: otp,
    },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://business.openapi.zalo.me/message/template",
    headers: {
      "Content-Type": "application/json",
      access_token: zaloOa.accessToken,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}
module.exports = {
  generateTokens,
  decodeToken,
  generateRandomOTP,
  sendZNS,
};
