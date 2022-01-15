import ajax from './ajax'
/**
 * 重要说明！！！
 * 因为，后台已对「/backend，/frontend，/files」接口代理,页面路由绝对禁止出现/backend、/frontend、/files（远景包括map）
 * 在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
 * @type {string}
 */

// 后台api接口
let backendAPI = '/backend';

// 登录接口
export const requestLogin = params => ajax(`${backendAPI}/login`, params, 'POST');
// 注销接口
export const requestLogout = params => ajax(`${backendAPI}/logout`, params, 'POST');
// 查询最近的告警事件列表
export const getLatestWarning = params => ajax(`${backendAPI}/chart/latestWarning${params}`, {}, 'GET');
// 查询设备概览
export const getClientOverview = params => ajax(`${backendAPI}/chart/clientOverview`, {}, 'GET');
// 查询产品概览
export const getProductOverview = params => ajax(`${backendAPI}/chart/productOverview`, {}, 'GET');
// 查询近7天的数据上报情况
export const getPre7DayCollect= params => ajax(`${backendAPI}/chart/pre7DayCollect`, {}, 'GET');

// 获取设备分页列表
export const getIotClientPage = params => ajax(`${backendAPI}/client`, params, 'GET');
// 添加设备
export const addIotClient = params => ajax(`${backendAPI}/client`, params, 'POST');
// 修改设备
export const editIotClient = params => ajax(`${backendAPI}/client`, params, 'PUT');
// 删除设备
export const deleteIotClient = params => ajax(`${backendAPI}/client`, params, 'DELETE');
// 获取设备下拉选框
export const getClientSelectList = params => ajax(`${backendAPI}/client/select`, params, 'GET');
// 获取设备认证信息
export const getIotIdentify = params => ajax(`${backendAPI}/identify/${params}`, {}, 'GET');


// 调度计划
export const getIotAppointmentPage = params => ajax(`${backendAPI}/appointment`, params, 'GET');
// 添加调度计划
export const addIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'POST');
// 修改调度计划
export const editIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'PUT');
// 删除调度计划
export const deleteIotAppointment = code => ajax(`${backendAPI}/appointment/${code}`, {}, 'DELETE');


// 获取所有的基本物理量
export const getIotSymbolUnits = params => ajax(`${backendAPI}/symbol/units`, params, 'GET');
// 获取告警结果
export const getIotWarringResultPage = params => ajax(`${backendAPI}/warning/result`, params, 'GET');
// 获取告警规则
export const getIotWarringRulePage = params => ajax(`${backendAPI}/warning/rules/${params}`, {}, 'GET');
// 添加告警规则
export const addIotWarringRule = params => ajax(`${backendAPI}/warning/rules`, params, 'POST');
// 修改告警规则
export const editIotWarringRule = params => ajax(`${backendAPI}/warning/rules`, params, 'PUT');
// 删除告警规则
export const deleteIotWarringRule = params => ajax(`${backendAPI}/warning/rules`, params, 'DELETE');


// 获取产品列表
export const getProductList = params => ajax(`${backendAPI}/product`, params, 'GET');
// 添加产品
export const addProduct = params => ajax(`${backendAPI}/product`, params, 'POST');
// 修改产品
export const editProduct = params => ajax(`${backendAPI}/product`, params, 'PUT');
// 删除产品
export const deleteProduct = params => ajax(`${backendAPI}/product/${params}`, {}, 'DELETE');

// 获取产品物模型列表
export const getProductAbilityList = id => ajax(`${backendAPI}/product/ability/${id}`, {}, 'GET');
// 添加产品物模型
export const addProductAbility = params => ajax(`${backendAPI}/product/ability`, params, 'POST');
// 修改产品物模型
export const editProductAbility = params => ajax(`${backendAPI}/product/ability`, params, 'PUT');
// 删除产品物模型
export const deleteProductAbility = id => ajax(`${backendAPI}/product/ability/${id}`, {}, 'DELETE');
// 获取标准物理量
export const getStandardList = () => ajax(`${backendAPI}/standard`,{},'GET')

// 查看采集信息
export const getClientIotCollectionPage = params => ajax(`${backendAPI}/collection`, params, 'GET');
// 查看历史执行过的指令
export const getHistoryCommand = params => ajax(`${backendAPI}/command/history`, params, 'GET');
// 查询指定设备最新的采集数据
export const getClientLatestCollect = client => ajax(`${backendAPI}/collection/latest/${client}`, {}, 'GET');
