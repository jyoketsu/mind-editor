import * as qiniu from "qiniu-js";
import api from "./api";

const guid = (len?: number, radix?: number) => {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  const uuid = [];
  let i = 0;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join("");
};

const qiniuUpload = (
  uptoken: string,
  file: any,
  qiniuRegion: string,
  qiniuDomain: string
) => {
  const putExtra = {
    // 文件原文件名
    fname: "",
    // 自定义变量
    params: {},
    // 限制上传文件类型
    mimeType: "image/jpeg",
  };

  const qiniuConfig = {
    useCdnDomain: true,
    disableStatisticsReport: false,
    retryCount: 5,
    // @ts-ignore
    region: qiniu.region[qiniuRegion || "z0"],
  };

  return new Promise(async function (resolve, reject) {
    try {
      const observer = {
        error(err: any) {
          alert("上传失败！");
        },
        complete(res: any) {
          const domain = qiniuDomain || "https://cdn-icare.qingtime.cn/";
          const url: string = domain + encodeURIComponent(res.key);

          // todo updateStorage
          if (!qiniuRegion) {
            api.qiniu.updateStorage([
              {
                url: url,
                fileType: file.type,
                fileSize: file.size,
              },
            ]);
          }

          resolve(url);
        },
      };

      // todo remainingStorage
      const res: any = !qiniuRegion
        ? await api.qiniu.remainingStorage(file.size)
        : { status: 200 };
      if (res.status === 200) {
        // 上传
        const observable = qiniu.upload(
          file,
          `${guid(8, 16)}${
            file.name ? file.name.substr(file.name.lastIndexOf(".")) : ".jpg"
          }`,
          uptoken,
          putExtra,
          qiniuConfig
        );
        // 上传开始
        observable.subscribe(observer);
      } else {
        reject(res);
      }
    } catch (error) {
      reject(error);
    }
  });
};

export default qiniuUpload;
