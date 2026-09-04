export interface IHttpError extends Error {
  status: number;
  error: string;
  response: Response;
}
