import React, { Component } from 'react';
import {Modal,Card,Row,Col,Button} from "antd";
import memoryUtils from "../../../utils/memoryUtils";
import {Redirect} from "react-router-dom";
import {getClientEnableString} from "../../../utils/enum";
import moment from 'moment';
import "./index.less"
import {getClientLatestCollect, getProductAbilityList} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
import {isEmptyObject} from "../../../utils/var";
import CommandModal from "./command"
/*
 * 文件名：view.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：设备控制面板
 */

// 定义组件（ES6）
class ClientCtrlModal extends Component {

  commandRef = React.createRef();

  state = {
    // 设备id
    clientId:{},
    visibleModal:false,
    loading:false,
    // 设备能力模型
    abilities:[],
    // 根据能力模型分组后的采集信息
    collectData:{},
    // 看板
    panel:[],
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
    _this.displayCollectAndAbility(val)
    _this.setState({
      clientId: val.id,
      visibleModal: true
    });
  };

  /**
   * 显示发送指令的弹窗
   */
  handleModalCommand = (value) => {
    this.commandRef.handleDisplay(value);
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
      _this.setState({collectData: data});
    } else {
      _this.setState({collectData: {}});
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**事件联动

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
      _this.setState({abilities: data});
    } else {
      _this.setState({abilities: []});
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  displayCollectAndAbility = async (client)=>{
    const _this = this;
    await _this.getClientLatestCollectData(client.id);
    await _this.getProductAbility(client.productId)
    let {abilities,collectData} = _this.state;
    if (!abilities){
      // 没有能力模型，不予显示
      return
    }
    /**
     * id: 1
     name: "温度"
     nowPage: null
     pageSize: null
     productId: 1
     property: "temperature"
     rwFlag: 1
     */
    // 把已经设置过的物模型剔除
    let panel = abilities.reduce((pre, abilitiesItem) => {
      const abilityId = abilitiesItem.id
      const collect = collectData[abilityId]
      const card =<Col span={6} key={abilityId}>
        <Card>
          <div style={{display: 'flow-root'}}>
            <span style={{color: '#544343',float:'left'}}>{abilitiesItem.name}</span>
            {1===abilitiesItem.rwFlag?null:<a style={{float:'right'}} onClick={()=>_this.handleModalCommand(abilitiesItem)}>下发指令</a>}
          </div>
          <div style={{fontSize: '2.5em',marginTop:'0.3em',marginBottom:'0.3em'}}>{!collect?'暂无数据':collect.value+abilitiesItem.standardUnit.symbol}</div>
          <div style={{color: '#ccc'}}>{!collect?<span>&nbsp;</span>:collect.collectTime}</div>
        </Card>
      </Col>
      pre.push(card);
      return pre
    }, []);
    _this.setState({panel:panel});
  }

  /**
   * 发送指令组件ref绑定
   * @param ref
   */
  bindCommandFormRef = (ref) => {
    this.commandRef = ref
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
    const {visibleModal,panel} = this.state;
    return (
        <Modal title="设备控制面板"
                className="client-v1-modal-info"
                width="60%" visible={visibleModal} maskClosable={false} closable={true}
                footer={null} okText={null} onOk={null} onCancel={this.handleCancel}>
          <Row gutter={[8, 8]}>
            {panel}
          </Row>
          <CommandModal onRef={this.bindCommandFormRef.bind(this)}/>
        </Modal>
    );
  }
}

// 对外暴露
export default ClientCtrlModal;
