import axios from "axios";
import Resource from "../interface/Resource";
const AUTH_URL = import.meta.env.VITE_AUTH_URL;
const API_URL = import.meta.env.VITE_API_URL;
let token = localStorage.getItem("auth_token") || "";

const request = {
  get(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "get",
          url: path,
          params: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  post(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "post",
          url: path,
          data: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  patch(path: string, params: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "patch",
          url: path,
          data: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  delete(path: string, params: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "delete",
          url: path,
          data: params,
          headers: {
            token: token,
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
};

const qiniu = {
  remainingStorage(fileSize?: number) {
    return request.get(AUTH_URL + "/qiniuResource/remainSize", { fileSize });
  },
  updateStorage(resourceArr: Resource[]) {
    return request.post(AUTH_URL + "/qiniuResource", { resourceArr });
  },
  deleteQiniu(urls: string[]) {
    return request.delete(AUTH_URL + "/qiniuResource", { urlArr: urls });
  },
};

export default {
  request,
  qiniu,
  getUrlInfo: (url: string) => {
    return request.get("https://nodeserver.qingtime.cn/urlIconOrigin?=", {
      linkUrl: url,
    });
  },
  setToken: (_token: string) => {
    localStorage.setItem("auth_token", _token);
    token = _token;
  },
  getToken: () => {
    return token;
  },
};
