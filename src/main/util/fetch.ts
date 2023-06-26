import _fetch from "node-fetch";

export async function fetch(...args) {
  const url = args[0];
  const options = args[1];
  const res = await _fetch(url, options);
  if (res.status >= 200 && res.status < 300) {
    return res;
  }
  return Promise.reject(res);
}
