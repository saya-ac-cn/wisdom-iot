/**
 * 后台菜单路由配置清单
 * 注意：仅支持 " 二 "级菜单
 * @type {*[]}
 * 重要说明！！！
 * 页面路由绝对禁止出现/backend1、/frontend、/files（远景包括map）
 * 在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
 */

const backstageMenuList = [
    {
        title: '产品管理',// 菜单标题名称
        key: '/backstage/device/product',// 对应的path
        icon: 'HistoryOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '设备管理',// 菜单标题名称
        key: '/backstage/device/client',// 对应的path
        icon: 'ToolOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '调度计划',// 菜单标题名称
        key: '/backstage/device/appointment',// 对应的path
        icon: 'HistoryOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '下发历史',// 菜单标题名称
        key: '/backstage/history/send',// 对应的path
        icon: 'HomeOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '历史采集',// 菜单标题名称
        key: '/backstage/history/receive',// 对应的path
        icon: 'HomeOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '告警记录',// 菜单标题名称
        key: '/backstage/waring/result',// 对应的path
        icon: 'FundProjectionScreenOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    }
];
export default backstageMenuList
