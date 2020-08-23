// 枚举工具类

/**
 * 获取网关的启用状态
 * @param key
 * @returns {*}
 */
export const getGatewayEnableString = (key) => {
  if (key === 1){
    return '已启用'
  } else if (key === 2) {
    return '已禁用'
  } else {
    return '-'
  }
}

/**
 * 获取设备的启用状态
 * @param key
 * @returns {*}
 */
export const getClientEnableString = (key) => {
  if (key === 1){
    return '已启用'
  } else if (key === 2) {
    return '已禁用'
  } else {
    return '-'
  }
}

/**
 * 获取设备的启用状态
 * @param key
 * @returns {*}
 */
export const getClientLevelString = (key) => {
  if (key === 1){
    return 'off'
  } else if (key === 2) {
    return 'on'
  } else {
    return '-'
  }
}
