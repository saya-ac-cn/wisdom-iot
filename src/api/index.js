import ajax from './ajax'
/**
 * 重要说明！！！
 * 因为，后台已对「/backend，/frontend，/files」接口代理,页面路由绝对禁止出现/backend、/frontend、/files（远景包括map）
 * 在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
 * @type {string}
 */

// 后台api接口
let backendAPI = '/backend';

// 前台api接口
let publicAPI = '/frontend';
let frontendAPI = publicAPI + '/Pandora';

// 登录接口
export const requestLogin = params => ajax(`${backendAPI}/login`, params, 'POST');
// 注销接口
export const requestLogout = params => ajax(`${backendAPI}/logout`, params, 'POST');

// 获取网关设备类型
export const getIotGatewayType = params => ajax(`${backendAPI}/gateway/type`, params, 'GET');
// 获取网关分页列表
export const getIotGatewayPage = params => ajax(`${backendAPI}/gateway`, params, 'GET');
// 添加网关
export const addIotGateway = params => ajax(`${backendAPI}/gateway`, params, 'POST');
// 修改网关
export const editIotGateway = params => ajax(`${backendAPI}/gateway`, params, 'PUT');
// 删除网关
export const deleteIotGateway = params => ajax(`${backendAPI}/gateway/${params}`, {}, 'DELETE');
// 获取网关详情
export const getIotGatewayEntity = params => ajax(`${backendAPI}/gateway/${params}`, {}, 'GET');
// 获取网关设备下拉选框
export const getIotGatewayList = params => ajax(`${backendAPI}/gatewayList`, params, 'GET');

// 获取设备分页列表
export const getIotClientPage = params => ajax(`${backendAPI}/client`, params, 'GET');
// 添加设备
export const addIotClient = params => ajax(`${backendAPI}/client`, params, 'POST');
// 修改设备
export const editIotClient = params => ajax(`${backendAPI}/client`, params, 'PUT');
// 删除设备
export const deleteIotClient = params => ajax(`${backendAPI}/client`, params, 'DELETE');
// 查看设备可用的序号
export const getAvailableSerialNum = params => ajax(`${backendAPI}/client/serialNum/${params}`, {}, 'GET');
// 获取设备下拉选框
export const getClientSelectList = params => ajax(`${backendAPI}/client/select`, params, 'GET');
// 获取产品下拉选框
export const getIotProductList = params => ajax(`${backendAPI}/product/list`, params, 'GET');

// 指令预约
export const getIotAppointmentPage = params => ajax(`${backendAPI}/appointment`, params, 'GET');
// 添加预约
export const addIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'POST');
// 修改预约
export const editIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'PUT');
// 删除预约
export const deleteIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'DELETE');


// 获取所有的基本物理量
export const getIotSymbolUnits = params => ajax(`${backendAPI}/symbol/units`, params, 'GET');
// 获取告警结果
export const getIotWarringResultPage = params => ajax(`${backendAPI}/warning/result`, params, 'GET');
// 获取告警规则
export const getIotWarringRulePage = params => ajax(`${backendAPI}/warning/rules`, params, 'GET');
// 添加告警规则
export const addIotWarringRule = params => ajax(`${backendAPI}/warning/rules`, params, 'POST');
// 修改告警规则
export const editIotWarringRule = params => ajax(`${backendAPI}/warning/rules`, params, 'PUT');
// 删除告警规则
export const deleteIotWarringRule = params => ajax(`${backendAPI}/warning/rules/${params}`, {}, 'DELETE');

// 获取所有的告警定义
export const getIotSystemRule = params => ajax(`${backendAPI}/system/rule`, params, 'GET');
// 获取设备绑定的告警规则
export const getClientIotWarringRulePage = params => ajax(`${backendAPI}/client/rules`, params, 'GET');
// 绑定的设备告警规则
export const addClientIotWarringRule = (clientId,params) => ajax(`${backendAPI}/client/rules/${clientId}`, params, 'POST');
// 修改设备绑定的告警规则
export const editClientIotWarringRule = params => ajax(`${backendAPI}/client/rules`, params, 'PUT');
// 删除告警规则绑定
export const deleteClientIotWarringRule = params => ajax(`${backendAPI}/client/rules`, params, 'POST');


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
