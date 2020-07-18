/**
 * 变量操作js工具类
 */


/**
 * 判断对象是否为空
 * 入参 data
 * 返回 为空返回true
 */
export const isEmptyObject = (data) => {
    // 手写实现的判断一个对象{}是否为空对象，没有任何属性 非空返回false
    for (let item in data)
        return false;
    return true;
};