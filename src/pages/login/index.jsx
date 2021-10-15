import React, {Component} from 'react';
import './index.less'
import {Button,message, Input} from 'antd';
import DocumentTitle from 'react-document-title'
import {requestLogin} from '../../api'
import {Redirect} from 'react-router-dom'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
/*
 * 文件名：index.jsx
 * 作者：刘能凯
 * 创建日期：2020-7-15 - 14:22
 * 描述：登录的路由组件
 */

const activeLabel = {
  lineHeight: "18px",
  fontSize: "18px",
  fontWeight: 100,
  top: "0px"
};

const activeSpin = {
  width: "100%"
};

const unactiveLabel = {
  lineHeight: "60px",
  fontSize: "24px",
  fontWeight: 300,
  top: "10px"
};

const unactiveSpin = {
  width: "0px"
};

// 定义组件（ES6）
class Login extends Component {

  state = {
    // 用户文本框状态
    userState: false,
    // 密码框状态
    pwdState: false,
    // 给用户输入的文本框和密码框
    userName: 'Pandora',
    passWord: 'Pandora',
    loading: false
  };


  /**
   * 用户名文本框失去焦点事件
   */
  userOnBlur = () => {
    let _this = this;
    let {userName} = _this.state;
    // 当用户文本框失去焦点，需要判断文本框是否有值，如果有值，此时不能把文本框还原缩小
    if (null === userName || "" === userName) {
      _this.setState({userState: false});
    } else {
      _this.setState({userState: true});
    }
  }

  /**
   * 用户名文本框获得焦点事件
   */
  userOnFocus = () => {
    let _this = this;
    _this.setState({userState: true});
  }

  /**
   * 用户名密码失去焦点事件
   */
  pwdOnBlur = () => {
    let _this = this;
    let {passWord} = _this.state;
    // 当密码框失去焦点，需要判断密码框是否有值，如果有值，此时不能把密码框还原缩小
    if (null === passWord || "" === passWord) {
      _this.setState({pwdState: false});
    } else {
      _this.setState({pwdState: true});
    }
  }

  /**
   * 用户名密码框获得焦点事件
   */
  pwdOnFocus = () => {
    let _this = this;
    _this.setState({pwdState: true});
  }

  /**
   * 双向绑定用户文本框
   * @param event
   */
  userInputChange = (event) => {
    let _this = this;
    const value = event.target.value;
    _this.setState({
      userName: value.trim()
    })
  };

  /**
   * 双向绑定密码框
   * @param event
   */
  pwdInputChange = (event) => {
    let _this = this;
    const value = event.target.value;
    _this.setState({
      passWord: value.trim()
    })
  };

  /**
   * 响应登录事件
   */
  loginHandle = async () => {
    let _this = this;
    let {userName,passWord} = _this.state;
    if (null === userName || null === passWord || '' === userName || '' === passWord){
      message.error('请输入用户名和密码');
      return
    }
    let loginParams = {account: userName, password: passWord};
    _this.setState({loading: true});
    const result = await requestLogin(loginParams);
    let {code, data} = result;
    _this.setState({loading: false});
    if (code === 0) {
      memoryUtils.user = data;// 保存在内存中
      storageUtils.saveUser(data); // 保存到local中
      // 跳转到管理界面 (不需要再回退回到登陆),push是需要回退
      this.props.history.replace('/backstage')
    } else if (code === 5) {
      message.error('请输入用户名和密码');
    } else {
      message.error('用户名或密码错误');
    }
  };

  render() {
    // 读取状态数据
    const {userState, pwdState, userName, passWord,loading} = this.state;
    return (
      <DocumentTitle title='物联网智慧家庭·统一身份认证入口'>
        <div className="login-register-container"
             style={{backgroundImage: `url('${process.env.PUBLIC_URL}/picture/login/login_background3.jpeg')`}}>
          <div className='second-background' style={{backgroundImage: `url('${process.env.PUBLIC_URL}/picture/login/login_background2.png')`}}>
            <div className="login-register-box">
              <div className="login-box">
                <div className="title">登录</div>
                <div className="input">
                  <label style={userState ? activeLabel : unactiveLabel}>用户名</label>
                  <Input type="text" value={userName} onChange={this.userInputChange} onBlur={this.userOnBlur}
                         onFocus={this.userOnFocus}/>
                  <span className="spin" style={userState ? activeSpin : unactiveSpin}></span>
                </div>
                <div className="input">
                  <label style={pwdState ? activeLabel : unactiveLabel}>密码</label>
                  <Input type="password" value={passWord} onChange={this.pwdInputChange} onBlur={this.pwdOnBlur}
                         onFocus={this.pwdOnFocus}/>
                  <span className="spin" style={pwdState ? activeSpin : unactiveSpin}></span>
                </div>
                <div className="button login">
                  <Button type="text" onClick={this.loginHandle} loading={loading}>登录</Button>
                </div>
                <Button type="link" className="pass-forgot">
                  忘记密码？
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

export default Login;
