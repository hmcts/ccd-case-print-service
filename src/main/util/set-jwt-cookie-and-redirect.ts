import { parse, format } from "url";

export function setJwtCookieAndRedirect(req, res, next) {
  let token = req.query.jwt;

  if (token) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true
    });

    let parsedUrl = parse(req.originalUrl, true);
    delete parsedUrl.query['jwt'];
    // Delete `search` to force the use of `query` in the result string
    delete parsedUrl.search;
    res.redirect(303, format(parsedUrl));
  } else {
    next();
  }
}
