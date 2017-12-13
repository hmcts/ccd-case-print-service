export const extract = (request) => {
  let pattern = /^\/[^\/]+\/([^\/]+)\/.+$/;
  let match = request.originalUrl.match(pattern) || [];

  return match[1];
};
