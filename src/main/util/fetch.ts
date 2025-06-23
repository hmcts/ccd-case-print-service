import _fetch from "node-fetch";

export const fetch = (url: string, options?: RequestInit) => {
  return _fetch(url, options)
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return res;
      }
      return Promise.reject(res);
    });
};
