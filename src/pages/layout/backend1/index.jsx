import React, {Component} from 'react';
import './index.less'
import {Redirect, Route, Switch, Link, withRouter} from 'react-router-dom'
import { MenuOutlined } from '@ant-design/icons';
import menuConfig from '../../../config/backendMenuConfig'
import memoryUtils from "../../../utils/memoryUtils";
import storageUtils from '../../../utils/storageUtils'
import {isEmptyObject} from "../../../utils/var"
import { Button, Menu, Popover, Avatar, Breadcrumb, Badge, Modal} from 'antd';
import { FundProjectionScreenOutlined, NotificationOutlined,ToolOutlined, HistoryOutlined, MessageOutlined, DesktopOutlined,HomeOutlined,ExceptionOutlined,CodeOutlined,LaptopOutlined} from '@ant-design/icons';
import DashBoard from '../../backend/dashboard'
import Gateway from '../../backend/gateway'
import Client from '../../backend/client'
import Appointment from '../../backend/appointment'
import {requestLogout} from "../../../api";
import WaringRule from "../../backend/waring";
import ClientRule from "../../backend/clientrule";
import WaringResult from "../../backend/waringresult";
/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/7/15 - 10:20 下午
 * 描述：后台主页
 */
const {SubMenu} = Menu;
// 定义组件（ES6）
class Backend1 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,// 默认让左侧的菜单展开
      openKeys: [],// 当前展开的菜单数组
    };
  }

  /***
   * 将字符串转换成组件
   * @param value
   * @returns {*}
   */
  transformComponent = (value) => {
    switch(value) {
      case 'DesktopOutlined': {
        return <DesktopOutlined/>
      }
      case 'FundProjectionScreenOutlined': {
        return <FundProjectionScreenOutlined/>
      }
      case 'ToolOutlined': {
        return <ToolOutlined/>
      }
      case 'HomeOutlined': {
        return <HomeOutlined/>
      }
      case 'HistoryOutlined': {
        return <HistoryOutlined/>
      }
      default: {
        return <MessageOutlined/>
      }
    }
  }

  /**
   * 初始化头像下拉菜单
   */
  initHeaderMenu = () => (
    <div className="backend-layout-header-info-hover">
      <div className='user-img-div'>
        <Avatar size={64} src={`${process.env.PUBLIC_URL}/picture/user/2020062697574.png`}/>
        <div className='operator-img'>
          <span>{this.userCatche.account}</span>
          <Button type="link" href='/backstage/set/info'>更换头像</Button>
        </div>
      </div>
      <div className='system-operator'>
        <Button type="link" href='/backstage/set/info'>设置</Button>
        <Button type="link" onClick={this.logout}>退出</Button>
      </div>
    </div>
  )

  /**
   * 根据menu的数据数组生成对应的标签数组
   * 使用reduce() + 递归调用
   **/
  getMenuNodes = (menuList) => {
    let _this = this;
    // 得到当前请求的路由路径
    const path = _this.props.location.pathname;
    return menuList.reduce((pre, item) => {
      // 向pre添加<Menu.Item>
      if (!item.children && item.hidden === false) {
        pre.push((
          //<Menu.Item key={item.key}>{item.title}</Menu.Item>
          <Menu.Item key={item.key}><Button type="link" href={item.key}>{item.title}</Button></Menu.Item>
        ))
      } else if (item.children && item.hidden === false) {
        // 查找一个与当前请求路径匹配的子Item
        const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0);
        // 如果存在, 说明当前item的子列表需要打开
        if (cItem) {
          _this.setState({
            openKeys:[item.key]
          })
        }
        // 向pre添加<SubMenu>
        pre.push((
          <SubMenu key={item.key} icon={_this.transformComponent(item.icon)} title={<span>{item.title}</span>}>
            {_this.getMenuNodes(item.children)}
          </SubMenu>
        ));
      }
      return pre
    }, [])
  };

  /**
   * 提取当前页面的标题
   **/
  getTitle = () => {
    // 得到当前请求路径
    const path = this.props.location.pathname;
    let titles = {title: [], local: ''};
    menuConfig.forEach(item => {
      if (item.key === path) { // 如果当前item对象的key与path一样,item的title就是需要显示的title
        titles.title.push((<Breadcrumb.Item key={item.key}>{item.title}</Breadcrumb.Item>));
        titles.local = item.title
      } else if (item.children) {
        // 在所有子item中查找匹配的
        const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0);
        // 如果有值才说明有匹配的
        if (cItem) {
          // 取出它的一级和二级title
          titles.title.push((<Breadcrumb.Item key={item.key}>{item.title}</Breadcrumb.Item>));
          titles.title.push((<Breadcrumb.Item key={cItem.key}>{cItem.title}</Breadcrumb.Item>));
          titles.local = cItem.title
        }
      }
    });
    return titles
  };

  /**
   * 一级菜单点击展开事件
   * @param _openKeys
   */
  onOpenChange = (_openKeys) => {
    let _this = this;
    const openKeys = this.state.openKeys;
    const latestOpenKey = _openKeys.find(key => openKeys.indexOf(key) === -1);
    menuConfig.reduce((pre, item) => {
      if (item.hidden === false){
        const cItem = _openKeys.find(cItem => openKeys.indexOf(cItem) === -1);
        // 如果存在, 说明当前item的子列表需要打开
        if (cItem) {
          // 切换
          _this.setState({
              openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }else {
          // 不切换保持原样
          _this.setState({ openKeys:_openKeys });
        }
      }
    }, [])
  };

  // 切换面板
  handlTabClick = () => {
    const collapsed = !this.state.collapsed;
    // 更新状态
    this.setState({collapsed: collapsed})
  };

  /*
   退出登陆
    */
  logout = () => {
    // 显示确认框
    Modal.confirm({
      title: '操作确认',
      content:'确定退出吗?',
      onOk: async () => {
        // 请求注销接口
        await requestLogout();
        // 删除保存的user数据
        storageUtils.removeUser();
        memoryUtils.user = {};
        // 跳转到login
        this.props.history.replace('/login')
      }
    })
  };


  /*
   * 在第一次render()之前执行一次
   * 为第一个render()准备数据(必须同步的)
   */
  componentWillMount() {
    this.userCatche = memoryUtils.user || {};
    console.log('---------',this.userCatche);
    if (!this.userCatche || !this.userCatche.account) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    console.log('---------',this.menuNodes);
    // 初始化左侧导航
    this.menuNodes = this.getMenuNodes(menuConfig);

    // 顶部用户头像下拉
    this.headerUserInfo = this.initHeaderMenu()
  }


  render() {
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.account) {
      console.log("未登录",user)
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    // 读取状态
    const {collapsed,openKeys} = this.state;
    // 得到当前需要显示的title
    const {title, local} = this.getTitle();
    console.log(title, local)
    return (
      <div className="backend1-container">
        <div className='background1-div' style={{backgroundImage:`url('${process.env.PUBLIC_URL+'/picture/login/login_background1.png' || user.background}')`}}>
        </div>
        <header className="background1-header">
          <div className='header-logo'>
            <div className='tab-operation'>
              <Button type="link" size='large' onClick={this.handlTabClick}>
                <MenuOutlined/>
              </Button>
            </div>
            <div className='project-div' style={{backgroundImage:`url('${process.env.PUBLIC_URL}/picture/svg/project.svg')`}}>
            </div>
            <div className='project-name'>
              物联网智慧家庭
            </div>
          </div>
          <div className='header-info'>
            <div className="header-info-alarm">
              {
                !(isEmptyObject(user.plan)) ?
                  <Popover content={user.plan.reduce((pre, item) => {pre.push(<p key={item.id}>{item.describe}</p>);return pre},[])} title="今天计划">
                    <Badge count={user.plan.length} dot color="#2db7f5">
                      <NotificationOutlined/>
                    </Badge>
                  </Popover> :
                  <Popover content="暂无告警" title="告警信息">
                    <Badge count={0} dot>
                      <NotificationOutlined/>
                    </Badge>
                  </Popover>
              }
            </div>
            <Popover trigger="hover" mouseEnterDelay={0.2} mouseLeaveDelay={0.4} content={this.headerUserInfo}  placement="bottomRight">
                            <span className="el-dropdown-link">
                                <img src={`${process.env.PUBLIC_URL}/picture/user/2020062697574.png`} alt={"Saya"}/>
                            </span>
            </Popover>
          </div>
        </header>
        <section className="background1-content">
          <div className={`leftmunu ${collapsed ? 'leftmunu-close' : 'leftmunu-open'}`}>
            <div className='menu-logo'>
              <div className={`logo-item ${collapsed?"menu-logo-close":null}`} onClick={this.addNotes}>
                添加设备
              </div>
            </div>
            <div className='menu-list'>
              <Menu className='menu-list-ul' subMenuCloseDelay={1}  subMenuOpenDelay={1}  onOpenChange={this.onOpenChange} openKeys={openKeys} defaultOpenKeys={openKeys} mode="inline"
                    inlineCollapsed={collapsed}>
                {
                  this.menuNodes
                }
              </Menu>
            </div>
            <div className={`menu-copyright ${collapsed?"menu-copyright-close":null}`}>
              <Button type="link" title='远程控制' href="/backstage/oss/wallpaper"><CodeOutlined/></Button>
              <Button type="link" title='网关管理' href="/backstage/set/dashBoard"><LaptopOutlined/></Button>
              <Button type="link" title='告警记录' href="/backstage/message/guestbook"><ExceptionOutlined/></Button>
            </div>
          </div>
          <div className='content-container'>
            <div className='pagename-div'>
              <div className='pagename-label'>
                <strong>{local}</strong>
                <Breadcrumb className="breadcrumb-inner">
                  <Breadcrumb.Item>所在位置</Breadcrumb.Item>
                  {
                    title
                  }
                </Breadcrumb>
              </div>
            </div>
            <div className='content-div'>
              <div className='container-div'>
                <Switch>
                  <Route path='/backstage/api/mana' component={DashBoard}/>
                  <Route path='/backstage/device/gateway' component={Gateway}/>
                  <Route path='/backstage/device/client' component={Client}/>
                  <Route path='/backstage/device/appointment' component={Appointment}/>
                  <Route path='/backstage/waring/rule' component={WaringRule}/>
                  <Route path='/backstage/client/rule' component={ClientRule}/>
                  <Route path='/backstage/waring/result' component={WaringResult}/>
                  {/*默认、及匹配不到时的页面*/}
                  <Redirect to='/backstage/api/mana'/>
                </Switch>
              </div>
            </div>
            <div className='operation-info'>
              {
                !(isEmptyObject(user.log)) ?
                  <span>{`您上次操作时间:${user.log.date},操作地点:${user.log.city}(${user.log.ip}),操作明细:${user.log.logType.describe}`}</span> :
                  <span>Hi，这是您第一次使用吧？如果需要帮助，请及时联系运营团队。</span>
              }
            </div>
          </div>
          <div className='quick-div'>
            <Button type="link" title='流水申报' href="/backstage/financial/transaction"><NotificationOutlined/></Button>
          </div>
        </section>
      </div>
    );
  }
}

// 对外暴露
export default Backend1;
