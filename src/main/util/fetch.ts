import _fetch from "node-fetch";

export const fetch = (url, options) => {
  const schemesList = ["http:", "https:"];
  const domainList = ["localhost"];

  console.log("domain list is: " + domainList);

  const theUrl = (new URL(url));

  console.log("calling url: " + url);
  console.log("calling url hostname : " + theUrl.hostname);

  try {
    if (schemesList.includes(theUrl.protocol) && domainList.includes(theUrl.hostname)) {
      const res = _fetch(theUrl, options);
      if (res.status >= 200 && res.status < 300) {
        return res;
      }
      return Promise.reject(res);
    }
  } catch (error) {
    // TypeError: Failed to fetch
    // console.log(' There was an error ', error);
  }
};
