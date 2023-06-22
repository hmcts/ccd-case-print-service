import _fetch from "node-fetch";
import { get } from "config";

export const fetch = (url, options) => {
  const schemesList = ["http:", "https:"];

  const url1 = get("idam.s2s_url");
  const url2 = get("idam.base_url");
  const url3 = get("case_data_store_url");
  const url4 = get("case_data_probate_template_url");

  const domainsList = [];
  domainsList.push(url1);
  domainsList.push(url2);
  domainsList.push(url3);
  domainsList.push(url4);

  console.log("domain list is: " + domainsList);
  console.log("calling url: " + url);

  const theUrl = (new URL(url));

  if (schemesList.includes(theUrl.protocol) && domainsList.includes(theUrl.hostname)) {
    return _fetch(theUrl, options)
      .then((res) => {

        if (res.status >= 200 && res.status < 300) {
            return res;
        }

        return Promise.reject(res);
      });
  }
};
