const parseCookies = (req, res, next) => {
  var kookie = {};
  console.log(JSON.stringify(req.headers));
  if (!req.headers.cookie) {
    // res.send({});
    next();
  } else {
    var headerArr = req.headers.cookie.split('=') // ['shortlyid', '32u2983']
    kookie[headerArr[0]] = headerArr[1]
    req.cookies = kookie;
    res.send();
    next();
  }
};

module.exports = parseCookies;