import React, { Component } from 'react';
import {Modal} from "antd";
import memoryUtils from "../../../utils/memoryUtils";
import {Redirect} from "react-router-dom";
import {getClientEnableString} from "../../../utils/enum";
import moment from 'moment';
import "./index.less"
/*
 * 文件名：command.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：下发指令
 */

// 定义组件（ES6）
class CommandModal extends Component {


  state = {
    ability:{},
    visibleModal:false
  };


  /**
   * 关闭弹框
   */
  handleCancel = () => {
    this.setState({visibleModal: false});
  };

  /**
   * 显示弹框
   * @param val
   */
  handleDisplay = (val) => {
    let _this = this;
    console.log('val',val);
    _this.setState({
      ability: val,
      visibleModal: true
    });
  };

  /**
   * 为第一次render()准备数据
   * 因为要异步加载数据，所以方法改为async执行
   */
  componentDidMount() {
    const _this = this;
    _this.props.onRef(_this);
  };

  render() {
    const {visibleModal,ability} = this.state;
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.account) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    return (
        <Modal title="下发指令"
                width="40%" visible={visibleModal} maskClosable={false} closable={true}
                footer={null} okText={null} onOk={null} onCancel={this.handleCancel}>

        </Modal>
    );
  }
}

// 对外暴露
export default CommandModal;
