// 字符串工具类

/**
 * 清除输入框的空格
 * @param name
 * @param str
 * @returns {*}
 */
export const clearTrimValueEvent = (value) => {
    return value.target.value.replace(/\s+/g, '');
}

/**
 * 生成随机长度不固定的字符串
 * @returns {string|*}
 */
export const generateRandomStr = () => {
  return Math.random().toString(36).substr(2);
}

/**
 * 生成随机长度固定的字符串
 * @param str 字符串
 * @param len 长度
 * @returns {string|*}
 */
export const generateRandomFixedStr = (str, len) => {
  if(str.length > len) return str.substr(0, len);
  if(str.length < len) return generateRandomFixedStr(str + generateRandomStr(), len);
  return str;
}
