import NodeMap from "tree-graph-react/dist/interfaces/NodeMap";
import Node from "tree-graph-react/dist/interfaces/Node";

export const is_mobile = () => {
  let regex_match =
    /(nokia|iphone|android|motorola|^mot-|softbank|foma|docomo|kddi|up.browser|up.link|htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte-|longcos|pantech|gionee|^sie-|portalmmm|jigs browser|hiptop|^benq|haier|^lct|operas*mobi|opera*mini|320x320|240x320|176x220|Mobile)/i;
  let u = navigator.userAgent;
  if (null == u) {
    return true;
  }
  let result = regex_match.exec(u);

  if (null == result) {
    return false;
  } else {
    return true;
  }
};

export const guid = (len?: number, radix?: number) => {
  var chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  var uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

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

export function getFileTypeByName(name: string) {
  const fileExtension = name.split(".").pop();
  if (
    fileExtension === "jpg" ||
    fileExtension === "png" ||
    fileExtension === "jpeg"
  ) {
    return "image/*";
  } else if (
    fileExtension === "mp3" ||
    fileExtension === "aac" ||
    fileExtension === "wav"
  ) {
    return "audio/*";
  } else if (fileExtension === "mp4") {
    return "video/*";
  } else if (fileExtension === "pdf") {
    return "application/pdf";
  } else if (
    fileExtension === "docx" ||
    fileExtension === "doc" ||
    fileExtension === "xls" ||
    fileExtension === "xlsx" ||
    fileExtension === "ppt" ||
    fileExtension === "pptx"
  ) {
    return "application/msword";
  } else {
    return "unknow";
  }
}

export const rgbDistance = (rgbArr1: number[], rgbArr2: number[]) => {
  const r3 = (rgbArr1[0] - rgbArr2[0]) / 256;
  const g3 = (rgbArr1[1] - rgbArr2[1]) / 256;
  const b3 = (rgbArr1[2] - rgbArr2[2]) / 256;

  const diff = Math.sqrt(r3 * r3 + g3 * g3 + b3 * b3);
  return diff;
};

export function download(url: string, fileName: string) {
  var a = document.createElement("a");
  var filename = fileName;
  a.href = url;
  a.download = filename;
  a.click();
}

export function isElectron() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf(" electron/") > -1) {
    return true;
  } else {
    return false;
  }
}

export function getDeviceType() {
  const ua = window.navigator.userAgent.toLowerCase();
  const matchs = ua.match(
    /electron|micromessenger|Android|webOS|iPhone|Macintosh|windows/i
  );
  return matchs && matchs.length ? matchs[0] : 1;
}

// 获取url中search的值
export const getSearchParamValue = (search: string, paramName: string) => {
  const QUERY_PARAMS = new URLSearchParams(search);
  return QUERY_PARAMS.get(paramName);
};

/**
 * @name plainTextToNaotuFormat
 * @description
 * mirror of kityminder-core
 * source: https://github.com/fex-team/kityminder-core/blob/dev/src/core/data.js#L80-L167
 * @param {string} text
 */
export const plainTextToNaotuFormat = (text: string) => {
  let children = [];
  let jsonMap: any = {};
  let level = 0;
  let LINE_SPLITTER = /\r|\n|\r\n/;
  let TAB_REGEXP = /^(\t|\x20{2})/;
  let lines = text.split(LINE_SPLITTER);
  let line = "";
  let jsonNode;
  let i = 0;

  function isEmpty(line: string) {
    return line === "" && !/\S/.test(line);
  }

  function getNode(line: string) {
    return {
      data: {
        id: guid(8, 16),
        text: line.replace(/^(\t|\x20{2})+/, "").replace(/(\t|\x20{2})+$/, ""),
      },
      children: [],
    };
  }

  function getLevel(text: string) {
    var level = 0;
    while (TAB_REGEXP.test(text)) {
      text = text.replace(TAB_REGEXP, "");
      level++;
    }
    return level;
  }

  function addChild(parent: any, node: any) {
    parent.children.push(node);
  }

  while ((line = lines[i++]) !== undefined) {
    line = line.replace(/&nbsp;{2}/g, ""); //空格数 /^(\t|\x20{2})/ {2}表示两个空格 &nbsp;&nbsp;同理
    if (isEmpty(line)) continue;

    level = getLevel(line);
    jsonNode = getNode(line);
    if (level === 0) {
      jsonMap = {};
      children.push(jsonNode);
      jsonMap[0] = children[children.length - 1];
    } else {
      if (!jsonMap[level - 1]) {
        throw new Error("格式错误"); // Invalid local format
      }
      addChild(jsonMap[level - 1], jsonNode);
      jsonMap[level] = jsonNode;
    }
  }
  return children;
};

/**
 * 获取子孙节点
 * @param node
 * @param nodeMap
 * @param includeSelf
 * @returns
 */
export const getAncestor = (
  node: Node,
  nodeMap: NodeMap,
  includeSelf?: boolean
) => {
  const getFather = (node: Node) => {
    const father = nodeMap[node.father];
    if (father) {
      ancestorList.unshift(father);
      getFather(father);
    }
  };

  let ancestorList: Node[] = includeSelf ? [node] : [];
  getFather(node);
  return ancestorList;
};
