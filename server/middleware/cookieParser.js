const parseCookies = (req, res, next) => {
  console.log(JSON.stringify(req.headers));
  if (!req.headers.cookie) {
    next();
  } else {
    var kookie1 = req.headers.Cookie.split('; ');

    if (kookie1 !== undefined ) {
      var kookie = req.headers.Cookie.split('; ').cookie1.reduce( (obj, item) => {
        obj[item.split('=')[0]] = item.split('=')[1];
        return obj;
      }, {});
    }
    req.cookies = kookie;
    res.send();
    next();
  }
};

module.exports = parseCookies;