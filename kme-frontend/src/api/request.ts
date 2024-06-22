import axios, { type Method, type AxiosResponse } from "axios";
import type { StaffSystem, StaffSystemId } from "../model/staff-system";

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

export function onGetAllStaffSystems(
  callback: (staffSystems: StaffSystem[]) => void,
) {
  const url = "/api/staff-system/all";
  request<StaffSystem[]>("GET", url, {}).then((response) => {
    callback(response.data);
  });
}

export function onGetStaffSystemById(
  staffSystemId: StaffSystemId | null,
  callback: (staffSystem: StaffSystem | null) => void,
) {
  let url = "/api/staff-system/";
  if (staffSystemId == null) {
    url += "sample";
  } else {
    url += staffSystemId.staffSystemId;
  }
  request<StaffSystem>("GET", url, {}).then(
    (response) => {
      callback(response.data);
    },
    () => {
      callback(null);
    },
  );
}

export function onSetStaffSystemById(
  staffSystem: StaffSystem,
  callback: (success: boolean) => void,
) {
  const url = "/api/staff-system/set";
  api
    .post(url, staffSystem)
    .then(() => callback(true))
    .catch(() => callback(false));
}
