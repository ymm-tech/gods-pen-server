
const captchapng = require('captchapng');

module.exports = app => {
  class Kaptcha extends app.Service {
    * getCaptcha(key) {
      const p = new captchapng(80, 30, key); // width,height,numeric captcha
      p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
      p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
      const img = p.getBase64();
      return img
    }
  }
  return Kaptcha;
};
