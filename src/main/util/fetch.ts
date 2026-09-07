import _fetch from "node-fetch";
import {IHttpError} from "../types/errors.types";

export const fetch = (url: string, options?: RequestInit) => {
  return _fetch(url, options)
    .then((res) => {
      if (res.status >= 200 && res.status < 300) {
        return res;
      }
      const error = new Error(`HTTP Error: ${res.status}`) as IHttpError;
      error.status = res.status;
      error.response = res;
      throw error;
    });
};
