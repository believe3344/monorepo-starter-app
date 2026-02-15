/**
 * URL地址
 * @param {*}s
 */
export const isURL = (s: string): boolean => /^http[s]?:\/\/.*/.test(s);

/**
 * 验证密码强度
 * @param value
 */
export const checkPassModes = (value: string): number => {
  let modes = 0;
  // 正则表达式验证符合要求的
  if (value.length < 1) return modes;
  if (/\d/.test(value)) modes++; // 数字
  if (/[a-z]/.test(value)) modes++; // 小写
  if (/[A-Z]/.test(value)) modes++; // 大写
  if (/\W/.test(value)) modes++; // 特殊字符
  return modes;
};

/**
 * @description 递归转换树形数据，支持自定义字段映射
 * @param {any[]} data - 要处理的树形数据数组
 * @param {string} [childrenKey='children'] - 子节点数组的属性名
 * @param {Record<string, string>} [mapping] - 字段映射关系，默认为 { key: 'id', title: 'name' }
 * @returns {any[]} - 转换后的新树形数据数组
 */
export const convertTreeData = <T>(
  data: any[],
  childrenKey = 'children',
  mapping: Record<string, string> = { key: 'id', title: 'name' },
) => {
  return data.map((item) => {
    const newItem = { ...item };
    for (const newKey in mapping) {
      const oldKey = mapping[newKey];
      if (Object.prototype.hasOwnProperty.call(item, oldKey)) {
        newItem[newKey] = item[oldKey];
      }
    }

    if (item[childrenKey] && Array.isArray(item[childrenKey]) && item[childrenKey].length > 0) {
      newItem[childrenKey] = convertTreeData(item[childrenKey], childrenKey, mapping);
    }
    return newItem as T;
  });
};

/**
 * 判断是否是IE
 */
export const isIE = () => {
  const bw = window.navigator.userAgent;
  const compare = (s: string) => bw.indexOf(s) >= 0;
  const ie11 = (() => 'ActiveXObject' in window)();
  return compare('MSIE') || ie11;
};

/**
 * 获取上传图片base64
 * @param file
 */
export const getFileBase64 = (file: Blob) =>
  new Promise((resolve, reject) => {
    const fileReader: any = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      const image = new Image();
      image.src = fileReader.result;
      image.onload = () =>
        resolve({
          base64: fileReader.result,
          width: image.width,
          height: image.height,
        });
    };
    fileReader.onerror = (error: any) => reject(error);
  });

/**
 * 创建formData参数(只针对有图片上传)
 * @param {*} params
 */
export function createdFormData(params: any) {
  const formData = new FormData();
  Object.keys(params).forEach((key) => {
    if (
      params[key] == 0 ||
      (params[key] != '' && params[key] != undefined && params[key] != null)
    ) {
      if (params[key] instanceof Array) {
        params[key].forEach((item: any) => {
          formData.append(`${key}[]`, item);
        });
      } else {
        formData.append(key, params[key]);
      }
    }
  });
  return formData;
}

// 判断某个dom元素是否包含在另一个dom元素中
export const contains = (parent: any, node: any): boolean => {
  return parent !== node && parent.contains(node);
};

// 格式化边界点位数据为二维数组
export const formatPolylinePoint = (polyline: any) => {
  const arr: any = [];
  polyline?.split(';').map((item: any) => {
    const point = item.split(',').map(Number);
    const flag = point.includes(NaN);
    if (!flag) {
      arr.push(point);
    }
  });
  return arr;
};

// 生成uuid
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// token
export const getToken = () => {
  const token = localStorage.getItem('ymw_token') as string;
  return token;
};

// 获取用户信息
export const getUserInfo = () => {
  const common = JSON.parse(sessionStorage.getItem('common') as string);
  return common?.userInfo?.userInfo;
};

// 判断字符串为空或全部为空格
export const isEmpty = (str: string) => {
  return str.match(/^[ ]*$/);
};

//全文单词首字母大写
export const replaceFirstUpper = (str: string) => {
  str = str.toLowerCase();
  return str.replace(/\b(\w)|\s(\w)/g, (m) => {
    return m.toUpperCase();
  });
};

//全文句段首字母大写
export const replaceFirstLower = (str: string) => {
  str = str.toLowerCase();
  return str.replace(/[a-zA-Z]/, (_, index) => {
    return str[index].toUpperCase();
  });
};

// 格式化文本
export const reverse = (str: string) => {
  return str && str.replace(/【0jeemaa0】/g, '&lt').replace(/【1jeemaa1】/g, '&gt');
};

// 下载文件，修改文件名
export const downloadFileOfOriginalName = (
  url: any,
  filename: any,
  file: any,
  isStream: any,
  decode: any,
) => {
  return new Promise((resolve, reject) => {
    /**
     * 保存
     * @param  {Blob} blob
     * @param  {String} name 想要保存的文件名称
     */
    const saveAs = (blob: any, name: any) => {
      if ((window.navigator as any).msSaveOrOpenBlob) {
        (navigator as any).msSaveBlob(blob, name);
      } else {
        const newUrl = window.URL.createObjectURL(blob);

        downloadFileInCurrentWindow(newUrl, name);

        window.URL.revokeObjectURL(newUrl);
        resolve(true);
      }
    };

    /**
     * 获取 blob
     * @param  {String} url 目标文件地址
     * @return {Promise}
     */
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    if (isStream) {
      xhr.setRequestHeader('token', localStorage.getItem('CNPAT_TOKEN') as string);
    }
    xhr.onprogress = () => {
      if (file) {
        file.downStatusText = '文件下载中...';
      }
    };
    xhr.onload = () => {
      let newFilename = filename;
      if (isStream) {
        const disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('filename') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            newFilename = matches[1].replace(/['"]/g, '');
            // 需要UTF-8转码
            if (decode) {
              newFilename = decodeURI(newFilename);
            }
          }
        }
      }
      saveAs(xhr.response, newFilename);
      if (file) {
        file.downStatusText = '已下载';
      }
    };
    xhr.onerror = (res) => {
      if (file) {
        file.downStatusText = '下载失败';
      }
      reject(res);
    };

    xhr.send();
  });
};
// 当前窗口下载文件
export const downloadFileInCurrentWindow = (url: any, fileName: any) => {
  let fileType = url.split('.').pop();
  fileType = fileType.split('?').shift();
  let name = url.split('/').pop();
  name = name.split('?').shift();
  const aTag = document.createElement('a');
  if (fileType && (fileType.toLowerCase() === 'txt' || fileType.toLowerCase() === 'xml')) {
    aTag.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(url));
  } else {
    aTag.setAttribute('href', url);
  }
  aTag.setAttribute('download', fileName || name);
  if (getBrowser() === 'Chrome') {
    aTag.target = '_blank';
  }
  // fix Firefox
  aTag.style.display = 'none';
  document.body.appendChild(aTag);
  aTag.click();
  document.body.removeChild(aTag);
};

// 判断浏览器
export const getBrowser = () => {
  const ua = navigator.userAgent.toLocaleLowerCase();
  let Browser!: string;
  if (ua.match(/msie/) != null || ua.match(/trident/) != null) {
    Browser = 'IE';
  } else if (ua.match(/firefox/) != null) {
    Browser = 'FF'; // 火狐
    return 'FF';
  } else if (ua.match(/ubrowser/) != null) {
    Browser = 'UC';
    return 'UC';
  } else if (ua.match(/opera/) != null) {
    Browser = 'OP'; // 欧朋
    return 'OP';
  } else if (ua.match(/bidubrowser/) != null) {
    Browser = 'baidu';
    return 'baidu';
  } else if (ua.match(/metasr/) != null) {
    Browser = 'SG'; // 搜狗
    return 'SG';
  } else if (ua.match(/tencenttraveler/) != null || ua.match(/qqbrowse/) != null) {
    Browser = 'QQ';
    return 'QQ';
  } else if (ua.match(/maxthon/) != null) {
    Browser = 'AY'; // 遨游
  } else if (ua.match(/chrome/) != null) {
    // 360或者chrome
    Browser = 'Chrome';
  } else if (ua.match(/safari/) != null) {
    Browser = 'Safari';
  }
  return Browser;
};

//获取浏览器信息
export const getPosType = () => {
  const agent = navigator.userAgent.toLowerCase();
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  if (agent.indexOf('win32') >= 0 || agent.indexOf('wow32') >= 0) {
    console.log('这是windows32位系统');
    return 'Window32';
  }
  if (agent.indexOf('win64') >= 0 || agent.indexOf('wow64') >= 0) {
    console.log('这是windows64位系统');
    return 'Window64';
  }
  if (isMac) {
    console.log('这是mac系统');
    return 'Mac';
  }
};

// 判断操作系统信息
export const getOSType = () => {
  if (/(Android)/i.test(navigator.userAgent)) {
    console.log('Android');
    return 'Android';
  } else if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    console.log('ios');
    return 'Ios';
  }
};

// 判断当前环境是否是微信环境
export const isWeixin = () => {
  const ua: any = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return true;
  } else {
    return false;
  }
};

// 复写replaceAll方法
export const mReplaceAll = (str: string, sKey: string, tKey: string) => {
  return str.replace(new RegExp(sKey, 'g'), tKey);
};

// 判断文本是否超出dom宽度
export const textRange = (el: any) => {
  if (el) {
    const textContent = el;
    const targetW = textContent.getBoundingClientRect().width;
    const range = document.createRange();
    range.setStart(textContent, 0);
    range.setEnd(textContent, textContent.childNodes.length);
    const rangeWidth = range.getBoundingClientRect().width;
    return rangeWidth > targetW;
  } else {
    return false;
  }
};

// 设置全局主题
export const setTheme = (theme: string) => {
  // 设置全局主题
  document.documentElement.setAttribute('theme', theme);
};

// 取到小数点后两位
export const numberToFix2 = (number: number) => {
  const num = (number && number.toString()) || '0';
  if (num.indexOf('.') > -1) {
    return Number(parseFloat(num.substr(0, num.indexOf('.') + 3)).toFixed(2));
  } else {
    return Number(parseFloat(num).toFixed(2));
  }
};
