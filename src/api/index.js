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

// 百度搜索地址
export const baiduSearchWord = 'http://www.baidu.com/s';
// 百度模糊搜索地址
export const baiduSearchSelect = `https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su`;
// 登录接口
export const requestLogin = params => ajax(`${backendAPI}/login/lab`, params, 'POST');
// 注销接口
export const requestLogout = params => ajax(`${backendAPI}/logout`, params, 'POST');

// 获取网关设备类型
export const getIotGatewayType = params => ajax(`${backendAPI}/api/iot/gateway/type`, params, 'GET');
// 获取网关分页列表
export const getIotGatewayPage = params => ajax(`${backendAPI}/api/iot/gateway`, params, 'GET');
// 添加网关
export const addIotGateway = params => ajax(`${backendAPI}/api/iot/gateway`, params, 'POST');
// 修改网关
export const editIotGateway = params => ajax(`${backendAPI}/api/iot/gateway`, params, 'PUT');
// 删除网关
export const deleteIotGateway = params => ajax(`${backendAPI}/api/iot/gateway`, params, 'DELETE');
// 获取网关详情
export const getIotGatewayEntity = params => ajax(`${backendAPI}/api/iot/gateway/${params}`, {}, 'GET');
// 获取网关设备下拉选框
export const getIotGatewayList = params => ajax(`${backendAPI}/api/iot/gatewayList`, params, 'GET');

// 获取网关分页列表
export const getIotClientPage = params => ajax(`${backendAPI}/api/iot/client`, params, 'GET');
// 添加设备
export const addIotClient = params => ajax(`${backendAPI}/api/iot/client`, params, 'POST');
// 修改设备
export const editIotClient = params => ajax(`${backendAPI}/api/iot/client`, params, 'PUT');
// 删除设备
export const deleteIotClient = params => ajax(`${backendAPI}/api/iot/client`, params, 'DELETE');

// 修改动态
export const editNews = params => ajax(`${backendAPI}/api/message/news/edit`, params, 'PUT');
// 审核留言
export const checkGuestBook = params => ajax(`${backendAPI}/api/message/guestbook/check`, params, 'PUT');
// 查看分页留言
export const getGuestBookList = params => ajax(`${backendAPI}/api/message/guestbook`, params, 'GET');
// 查看分页后的图片
export const getPictureList = params => ajax(`${backendAPI}/api/oss/picture`, params, 'GET');
// 上传壁纸
export const uploadWallpaper = `${backendAPI}/api/oss/picture/wallpaper`;
// 删除壁纸/插图
export const deletePicture = params => ajax(`${backendAPI}/api/oss/picture/delete`, params, 'DELETE');
// 上传文件
export const uploadFile = `${backendAPI}/api/oss/files/upload`;
// 查看分页后的文件
export const getFileList = params => ajax(`${backendAPI}/api/oss/files`, params, 'GET');
// 删除文件
export const deleteFile = params => ajax(`${backendAPI}/api/oss/files/delete`, params, 'DELETE');
// 修改文件
export const editFile = params => ajax(`${backendAPI}/api/oss/files/edit`, params, 'PUT');
// 下载文件
export const downloadFileForAdmin = `${backendAPI}/api/oss/files/download/`;
// 创建笔记簿
export const createNoteBook = params => ajax(`${backendAPI}/api/message/notebook/create`, params, 'POST');
// 修改笔记簿
export const updateNoteBook = params => ajax(`${backendAPI}/api/message/notebook/edit`, params, 'PUT');
// 删除笔记簿
export const deleteNoteBook = params => ajax(`${backendAPI}/api/message/notebook/delete`, params, 'DELETE');
// 获取笔记簿列表
export const getNoteBookList = params => ajax(`${backendAPI}/api/message/notebook`, params, 'GET');
// 获取笔记簿
export const getNoteBookGroup = params => ajax(`${backendAPI}/api/message/notebook/group`, params, 'GET');
// 查询单条笔记簿
export const getNoteBook = params => ajax(`${backendAPI}/api/message/notebook/show`, params, 'GET');
// 创建笔记
export const createNotes = params => ajax(`${backendAPI}/api/message/notes/create`, params, 'POST');
// 修改笔记
export const updateNotes = params => ajax(`${backendAPI}/api/message/notes/edit`, params, 'PUT');
// 删除笔记
export const deleteNotes = params => ajax(`${backendAPI}/api/message/notes/delete`, params, 'DELETE');
// 获取笔记
export const getNotesList = params => ajax(`${backendAPI}/api/message/notes`, params, 'GET');
// 查询单条笔记
export const getNotes = params => ajax(`${backendAPI}/api/message/notes/show`, params, 'GET');
// 获取该月计划
export const getPlanList = params => ajax(`${backendAPI}/api/set/plan`, params, 'GET');
// 添加计划
export const createPlan = params => ajax(`${backendAPI}/api/set/plan/create`, params, 'POST');
// 修改计划
export const updatePlan = params => ajax(`${backendAPI}/api/set/plan/edit`, params, 'PUT');
// 删除计划
export const deletePlan = params => ajax(`${backendAPI}/api/set/plan/delete`, params, 'DELETE');
// 获取交易类别
export const getFinancialType = params => ajax(`${backendAPI}/api/financial/transactionType`, params, 'GET');
// 获取财政流水
export const getTransactionList = params => ajax(`${backendAPI}/api/financial/transaction`, params, 'GET');
// 财政申报
export const applyTransaction = params => ajax(`${backendAPI}/api/financial/insertTransaction`, params, 'POST');
// 修改流水
export const updateTransaction = params => ajax(`${backendAPI}/api/financial/updateTransaction`, params, 'PUT');
// 删除流水
export const deleteTransaction = params => ajax(`${backendAPI}/api/financial/deleteTransaction`, params, 'DELETE');
// 导出流水
export const downTransaction = `${backendAPI}/api/financial/outTransactionListExcel`;
// 导出流水明细
export const outTransactionInfoExcel = `${backendAPI}/api/financial/outTransactionInfoExcel`;
// 获取流水明细
export const getTransactionInfo = params => ajax(`${backendAPI}/api/financial/transactionInfo`, params, 'GET');
// 添加流水明细
export const insertTransactioninfo = params => ajax(`${backendAPI}/api/financial/insertTransactioninfo`, params, 'POST');
// 修改流水明细
export const updateTransactioninfo = params => ajax(`${backendAPI}/api/financial/updateTransactioninfo`, params, 'PUT');
// 删除流水明细
export const deleteTransactioninfo = params => ajax(`${backendAPI}/api/financial/deleteTransactioninfo`, params, 'DELETE');
// 按天统计流水
export const totalTransactionForDay = params => ajax(`${backendAPI}/api/financial/totalTransactionForDay`, params, 'GET');
// 导出按天统计的报表
export const outTransactionForDayExcel = `${backendAPI}/api/financial/outTransactionForDayExcel`;
// 按月统计流水
export const totalTransactionForMonth = params => ajax(`${backendAPI}/api/financial/totalTransactionForMonth`, params, 'GET');
// 导出按月统计的报表
export const outTransactionForMonthExcel = `${backendAPI}/api/financial/outTransactionForMonthExcel`;
// 按年统计流水
export const totalTransactionForYear = params => ajax(`${backendAPI}/api/financial/totalTransactionForYear`, params, 'GET');
// 导出按月统计的报表
export const outTransactionForYearExcel = `${backendAPI}/api/financial/outTransactionForYearExcel`;
// 创建接口
export const createApi = params => ajax(`${backendAPI}/api/set/api/create`, params, 'POST');
// 修改接口
export const editApi = params => ajax(`${backendAPI}/api/set/api/edit`, params, 'PUT');
// 删除笔记
export const deleteApi = params => ajax(`${backendAPI}/api/set/api/delete`, params, 'DELETE');
// 获取接口
export const getApi = params => ajax(`${backendAPI}/api/set/api/list`, params, 'GET');
// 查看数据库备份执行列表
export const getBackUpDBList = params => ajax(`${backendAPI}/api/oss/db`, params, 'GET');
// 下载备份的数据库文件
export const downloadBackUpDB = `${backendAPI}/api/oss/db/download/`;
// 获取后台监控统计
export const getDashBoard = params => ajax(`${backendAPI}/api/set/dashBoard`, params, 'GET');
// 查询单条便笺
export const getMemo = params => ajax(`${backendAPI}/api/message/memo/show`, params, 'GET');
// 获取分页便笺
export const getMemoList = params => ajax(`${backendAPI}/api/message/memo`, params, 'GET');
// 添加便笺
export const createMemo = params => ajax(`${backendAPI}/api/message/memo/create`, params, 'POST');
// 修改便笺
export const updateMemo = params => ajax(`${backendAPI}/api/message/memo/edit`, params, 'PUT');
// 删除便笺
export const deleteMemo = params => ajax(`${backendAPI}/api/message/memo/delete`, params, 'DELETE');

// 前台部分
// 获取动态列表
export const queryNews = params => ajax(`${frontendAPI}/news`, params, 'GET');
// 获取文件列表
export const queryFile = params => ajax(`${frontendAPI}/file`, params, 'GET');
// 下载文件
export const downloadFiles = `${frontendAPI}/files/download/`;
// 获取行程安排
export const queryPlan = params => ajax(`${frontendAPI}/plan`, params, 'GET');
// 留言
export const writeboard = params => ajax(`${publicAPI}/write/board`, params, 'POST');
// 获取笔记簿
export const queryNotebook = params => ajax(`${frontendAPI}/notebook`, params, 'GET');
// 获取笔记
export const queryNote = params => ajax(`${frontendAPI}/notes`, params, 'GET');
// 获取动态详情
export const queryNewsInfo = params => ajax(`${frontendAPI}/news/info`, params, 'GET');
// 获取笔记详情
export const queryNotesInfo = params => ajax(`${frontendAPI}/notes/info`, params, 'GET');

