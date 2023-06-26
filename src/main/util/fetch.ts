import _fetch from "node-fetch";

export const fetch = (...args) => {
  const schemesList = ["http:", "https:"];
  const url = (new URL(args[0]+""));
  const options = args[1]+"";
  if (schemesList.includes(url.protocol)) {
    return _fetch(url, options)
      .then((res) => {

        if (res.status >= 200 && res.status < 300) {
            return res;
        }

        return Promise.reject(res);
      });
  }
};
