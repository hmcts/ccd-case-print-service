import { format, parse } from "url";

export function setJwtCookieAndRedirect(req, res, next) {
  const token = req.query.jwt;

  if (token) {
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
    });

    const parsedUrl = parse(req.originalUrl, true);
    const JWT = "jwt";
    delete parsedUrl.query[JWT];
    // Delete `search` to force the use of `query` in the result string
    delete parsedUrl.search;
    res.redirect(303, format(parsedUrl));
  } else {
    next();
  }
}
