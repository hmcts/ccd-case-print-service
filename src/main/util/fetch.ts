import _fetch from "node-fetch";
import { get } from "config";

export const fetch = (url, options) => {
  const schemesList = ["http:", "https:"];
  const domainsList = [get("idam.s2s_url"), get("idam.base_url"), get("case_data_store_url"), get("case_data_probate_template_url")];
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
