import _fetch from "node-fetch";

export const fetch = (...args) => { // comment
  return _fetch(...args) // comment
    .then((res) => {

      if (res.status >= 200 && res.status < 300) { // comment here
          return res; // comment
      }

      return Promise.reject(res);
    });
};
