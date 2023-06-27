import _fetch from "node-fetch";

export const fetch = (url, options) => {
  const schemesList = ["http:", "https:"];
  const constUrl = (new URL(url));
  if (schemesList.includes(constUrl.protocol)) {
    return _fetch(url.replace("\n", "").replace("\r", ""), options)
    .then((res) => {

      if (res.status >= 200 && res.status < 300) {
          return res;
      }

      return Promise.reject(res);
    });
  }
};
