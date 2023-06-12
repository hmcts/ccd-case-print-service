import _fetch from "node-fetch";

//comment to trigger sonar scan on this file
export const fetch = (...args) => {
  return _fetch(...args)
  //comment to trigger sonar scan on this file
    .then((res) => {

      if (res.status >= 200 && res.status < 300) {
          return res;
      }

      return Promise.reject(res);
    });
};
