import axios, { type Method, type AxiosResponse } from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_HOST,
});

export default function request<T>(
  method: Method,
  url: string,
  params: unknown,
): Promise<AxiosResponse<T>> {
  return api.request<T>({
    method,
    url,
    params,
  });
}
