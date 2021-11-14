// 枚举工具类
/**
 * 获取网关的启用状态
 * @param key
 * @returns {*}
 */
export const getGatewayEnableString = (key) => {
    if (key === 1) {
        return '已启用'
    } else if (key === 2) {
        return '已禁用'
    } else {
        return '-'
    }
};

/**
 * 获取设备的启用状态
 * @param key
 * @returns {*}
 */
export const getClientEnableString = (key) => {
    if (key === 1) {
        return '已启用'
    } else if (key === 2) {
        return '已禁用'
    } else {
        return '-'
    }
};

/**
 * 获取设备的启用状态
 * @param key
 * @returns {*}
 */
export const getClientLevelString = (key) => {
    if (key === 1) {
        return 'off'
    } else if (key === 2) {
        return 'on'
    } else {
        return '-'
    }
};

/**
 * 获取预约指令执行状态
 * @param key
 * @returns {*}
 */
export const getAppointmentExcuteStatusString = (key) => {
    if (key === 1) {
        return '已创建'
    } else if (key === 2) {
        return '已下发'
    } else {
        return '-'
    }
};


/**
 * 获取预约指令执行状态
 * @param key
 * @returns {*}
 */
export const getWaringRuleStatusString = (key) => {
    if (key === 1) {
        return '启用'
    } else if (key === 2) {
        return '禁用'
    } else {
        return '-'
    }
};

/**
 * 获取产品状态
 * @param key
 * @returns {*}
 */
export const getProductStatusString = (key) => {
    if (key === 1) {
        return '正常'
    } else if (key === 2) {
        return '禁用'
    } else {
        return '-'
    }
};

/**
 * 将后台的比较运算符转换成中文释义
 * @param symbol
 * @returns {string}
 */
export const getSymbolEnumString = (symbol) => {
    switch (symbol) {
        case 'EQ':
            return '等于';
        case 'NEQ':
            return '不等于';
        case 'GT':
            return '大于';
        case 'GTE':
            return '大于等于';
        case 'LT':
            return '小于';
        case 'LTE':
            return '小于等于';
        case 'RANGE':
            return '范围';
        default:
            return '-'
    }
};