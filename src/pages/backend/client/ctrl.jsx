import React, { Component } from 'react';
import {Modal,Card,Row,Col,Button} from "antd";
import memoryUtils from "../../../utils/memoryUtils";
import {Redirect} from "react-router-dom";
import {getClientEnableString} from "../../../utils/enum";
import moment from 'moment';
import "./index.less"
import {getClientLatestCollect, getProductAbilityList} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
/*
 * 文件名：view.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：设备控制面板
 */

// 定义组件（ES6）
class ClientCtrlModal extends Component {


  state = {
    clientId:{},
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
    _this.getClientLatestCollectData(val.id);
    _this.getProductAbility(val.productId)
    console.log('val',val);
    _this.setState({
      clientId: val.id,
      visibleModal: true
    });
  };

  /**
   * 获取设备最新的采集信息
   * @returns {Promise<void>}
   */
  getClientLatestCollectData = async (clientId) => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getClientLatestCollect(clientId);
    if (code === 0) {
      console.log(data)
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取产品物模型列表数据
   * @returns {Promise<void>}
   */
  getProductAbility = async (id) => {
    if (!id){
      return;
    }
    const _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getProductAbilityList(id);
    if (code === 0) {
      console.log(data)
      //_this.setState({abilities: data,abilitySelect: abilitySelect});
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
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
    const {visibleModal,clientId} = this.state;
    return (
        <Modal title="设备控制面板"
                className="client-v1-modal-info"
                width="60%" visible={visibleModal} maskClosable={false} closable={true}
                footer={null} okText={null} onOk={null} onCancel={this.handleCancel}>
          <Row gutter={[8, 8]}>
            <Col span={6}>
              <Card loading={true}>
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div style={{display: 'flow-root'}}>
                  <span style={{color: '#544343',float:'left'}}>电压</span>
                  <a style={{float:'right'}}>下发指令</a>
                </div>
                <div style={{fontSize: '2.5em',marginTop:'0.3em',marginBottom:'0.3em'}}>220V</div>
                <div style={{color: '#ccc'}}>2022-01-23 14:51:37</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
              </Card>
            </Col>
          </Row>
        </Modal>
    );
  }
}

// 对外暴露
export default ClientCtrlModal;
