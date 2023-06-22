import _fetch from "node-fetch";
import { get } from "config";

export const fetch = (url, options) => {
  const schemesList = ["http:", "https:"];

  const url1 = get("idam.s2s_url");
  const url2 = get("idam.base_url");
  const url3 = get("case_data_store_url");
  const url4 = get("case_data_probate_template_url");

  const domainsList = [`${url1}`, `${url2}`, `${url3}`, `${url4}`];

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
