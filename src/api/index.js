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
export const deleteIotGateway = params => ajax(`${backendAPI}/gateway`, params, 'DELETE');
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
// 获取设备下拉选框
export const getClientSelectList = params => ajax(`${backendAPI}/client/select`, params, 'GET');

// 指令预约
export const getIotAppointmentPage = params => ajax(`${backendAPI}/appointment`, params, 'GET');
// 添加预约
export const addIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'POST');
// 修改预约
export const editIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'PUT');
// 删除预约
export const deleteIotAppointment = params => ajax(`${backendAPI}/appointment`, params, 'DELETE');
