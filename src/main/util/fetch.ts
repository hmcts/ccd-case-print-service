import _fetch from "node-fetch";

export const fetch = (url, options) => {
  (async () => {
    try {
      const schemesList = ["http:", "https:"];
      const domainList = ["localhost"];

      console.log("domain list is: " + domainList);

      const theUrl = (new URL(url));

      console.log("calling url: " + url);
      console.log("calling url hostname : " + theUrl.hostname);

      if (schemesList.includes(theUrl.protocol) && domainList.includes(theUrl.hostname)) {
        const response = await _fetch(theUrl, options)
        if (response.status >= 200 && response.status < 300) {
          const json = await response.json()
          console.log(json.url);
          console.log(json.explanation);
          return response;
        }
        return Promise.reject(response);
      }
    } catch (error) {
      console.log(error.response.body);
    }
  })();
};
