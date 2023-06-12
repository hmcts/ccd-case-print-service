import _fetch from "node-fetch";

export const fetch = (...args) => {
  return _fetch(...args)
    .then((res) => {

      if (res.status >= 300 && res.status < 400) {
          return res;
      }

      return Promise.reject(res);
    });
};
