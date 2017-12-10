import { parse as urlParse } from "url";
import { format } from "url";
import { parse as querystringParse } from "querystring";
import { stringify } from "querystring";

export function setJwtCookieAndRedirect(req, res, next) {
  let token = req.query.jwt;

  if (token) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true
    });

    let parsedUrl = urlParse(req.originalUrl);
    let parsedQueryString = querystringParse(stringify(parsedUrl.query));
    delete parsedQueryString.jwt;
    parsedUrl.query = parsedQueryString;
    // Delete `search` to force the use of `query` in the result string
    delete parsedUrl.search;
    res.redirect(303, format(parsedUrl));
  } else {
    next();
  }
}
