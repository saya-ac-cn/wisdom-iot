import React, { Component } from 'react';
import {Modal} from "antd";
import memoryUtils from "../../../utils/memoryUtils";
import {Redirect} from "react-router-dom";
import {getClientEnableString} from "../../../utils/enum";
import moment from 'moment';
import "./index.less"
/*
 * 文件名：view.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：显示设备详情
 */

// 定义组件（ES6）
class ViewClientModal extends Component {


  state = {
    client:{},
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
      client: val,
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
    const {visibleModal,client} = this.state;
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.account) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    return (
        <Modal title="设备详情"
                className="client-v1-modal-info"
                width="60%" visible={visibleModal} maskClosable={false} closable={true}
                footer={null} okText={null} onOk={null} onCancel={this.handleCancel}>
          <table>
            <caption>{client.name || "-"}</caption>
            <colgroup>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
              <col width="10%"/>
            </colgroup>
            <tbody>
            <tr>
              <td className="label">设备ID</td>
              <td className="value">{client.id || "-"}</td>
              <td className="label">启用状态</td>
              <td className="value">{!client.enable?"-":getClientEnableString(client.enable)}</td>
              <td className="label">产品名</td>
              <td className="value">{client.productName||"-"}</td>
              <td className="label">认证编码</td>
              <td colSpan="3" className="value">{!client.authenInfo?"-":client.authenInfo.username}</td>
            </tr>
            <tr>
              <td className="label" colSpan="2">设备最后一次心跳时间</td>
              <td className="value" colSpan="2">{client.lastLinkTime || "-"}</td>
              <td className="label">设备创建时间</td>
              <td className="value" colSpan="2">{client.createTime || "-"}</td>
              <td className="label">设备修改时间</td>
              <td className="value" colSpan="2">{client.updateTime || "-"}</td>
            </tr>
            </tbody>
          </table>
          <div className="print-time">若数据显示异常，请重新打开&nbsp;&nbsp;&nbsp;&nbsp;平台打印时间：{moment().format("YYYY-MM-DD HH:mm:ss") }</div>
        </Modal>
    );
  }
}

// 对外暴露
export default ViewClientModal;
