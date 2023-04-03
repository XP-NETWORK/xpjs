import { AppConfig } from "..";
import axios, { AxiosInstance } from "axios";

export type WhitelistedService = AxiosInstance;

export const whitelistedService = (appConfig: AppConfig) => {
  return axios.create({
    baseURL: appConfig.whitelistedUri,
  });
};
