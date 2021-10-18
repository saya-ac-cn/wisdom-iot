import React, { Component } from 'react';
import {Form, Input, Card, Tooltip, Select, Radio, Modal} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getIotGatewayList, getIotProductList, getAvailableSerialNum, addIotClient, editIotClient} from '../../../api'
import {openNotificationWithIcon} from "../../../utils/window";
import {clearTrimValueEvent} from "../../../utils/string";

/*
 * 文件名：edit.jsx
 * 作者：saya
 * 创建日期：2020/8/23 - 3:44 下午
 * 描述：修改设备
 */
const { Option } = Select;
// 定义组件（ES6）
class EditClient extends Component {

  formRef = React.createRef();

  state = {
    client:{},
    // 这两个参数指标保存起来，当用户放弃更换网关时，允许还原
    lastSelectGateway:null,
    lastSelectSerialNum:null,
    visibleModal:false,
    gatewaySelectData: [],// 系统返回的网关设备类别
    productSelectData:[],// 系统返回的产品列表
    availableSerialNum:[]// 系统返回的可用设备序号
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
    },function () {
      //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
      if(!val || !val.id){
        _this.formRef.current.setFieldsValue({"gatewayId":null,"serialNum":null,"productId":null,"name":null,"enable":null});
      }else{
        _this.formRef.current.setFieldsValue(val);
        _this.getSerialNumRadioData(val.gatewayId);
        _this.setState({
          lastSelectGateway:val.gatewayId,
          lastSelectSerialNum:val.serialNum,
        });
      }
    });
  };


  /**
   * 响应用户提交事件
   */
  handleSubmit = () =>{
    const _this = this;
    const client = _this.state.client;
    _this.formRef.current.validateFields(["gatewayId","serialNum","productId","name","enable"]).then(value => {
      if(!client.id){
        let para = {
          gatewayId: value.gatewayId,
          productId: value.productId,
          name: value.name,
          serialNum:value.serialNum,
          enable: value.enable,
        };
        // 执行添加
        _this.handleAdd(para);
      }else{
        // 执行修改
        let para = {
          id: client.id,
          gatewayId: value.gatewayId,
          name: value.name,
          enable: value.enable,
          serialNum:value.serialNum
        };
        _this.handleRenew(para);
      }
    }).catch(e => console.log("修改或添加网关错误",e));
  };

  /**
   * 添加
   * @param value
   * @returns {boolean}
   */
  handleAdd = async (value) =>{
    let _this = this;
    const {msg, code} = await addIotClient(value);
    if (code === 0) {
      openNotificationWithIcon("success", "操作结果", "添加成功");
      // 重置表单
      _this.formRef.current.resetFields();
      // 刷新列表
      _this.props.refreshList();
      // 关闭窗口
      _this.handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };


  /**
   * 修改
   * @param value
   */
  handleRenew = async (value) =>{
    let _this = this;
    const {msg, code} = await editIotClient(value);
    if (code === 0) {
      openNotificationWithIcon("success", "操作结果", "修改成功");
      // 重置表单
      _this.formRef.current.resetFields();
      // 刷新列表
      _this.props.refreshList();
      // 关闭窗口
      _this.handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取网关类别
   * @returns {Promise<void>}
   */
  getGateWaySelectData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotGatewayList();
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      let gatewaySelectData = [];
      gatewaySelectData.push((<Option key={-1} value="">请选择</Option>));
      data.forEach(item => {
        gatewaySelectData.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
      });
      _this.setState({
        gatewaySelectData
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取产品类型
   * @returns {Promise<void>}
   */
  getProductSelectData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotProductList();
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      let productSelectData = [];
      productSelectData.push((<Option key={-1} value="">请选择</Option>));
      data.forEach(item => {
        productSelectData.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
      });
      _this.setState({
        productSelectData
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 网关下拉选择列表发生切换事件后，需要级联触发网关下可用的数字引脚变化，同时，已选的序号需要置空
   * @param val
   */
  gateWaySelectChange = (val) => {
    let _this = this;
    let {lastSelectGateway,lastSelectSerialNum} = _this.state;
    if (null !== lastSelectGateway && null !== lastSelectSerialNum && lastSelectGateway === val){
      // 用户最终还是放弃了挣扎
      _this.formRef.current.setFieldsValue({"serialNum":lastSelectSerialNum});
      return
    }
    _this.formRef.current.setFieldsValue({"serialNum":null});
    if (!val){
      _this.setState({
        availableSerialNum:[]
      });
      return
    }
    _this.getSerialNumRadioData(val);
  };

  /**
   * 获取指定网关下的数字引脚
   * @param val 网关id
   * @returns {Promise<void>}
   */
  getSerialNumRadioData = async (val) => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getAvailableSerialNum(val);
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      let availableSerialNum = [];
      for(let serialNum in data){
        if (data[serialNum]){
          availableSerialNum.push((<Radio.Button key={serialNum} value={serialNum} disabled>序号{serialNum}({data[serialNum]}已使用)</Radio.Button>));
        }else{
          availableSerialNum.push((<Radio.Button key={serialNum} value={serialNum}>序号{serialNum}(未使用)</Radio.Button>));
        }
      }
      _this.setState({
        availableSerialNum
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  componentWillMount () {
    const _this = this;
    // 初始化下拉列表数据
    _this.getGateWaySelectData();
    _this.getProductSelectData();
    _this.props.onRef(_this);
    _this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18},
    };
  }


  render() {
    const {gatewaySelectData,productSelectData,availableSerialNum,client,visibleModal} = this.state;
    return (
        <Modal title={!client || !client.id ? '添加设备':'编辑设备'} visible={visibleModal} maskClosable={false} width="60%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
          <Form {...this.formItemLayout} ref={this.formRef}>
            <Card title="网关信息" bordered={false}>
              <Form.Item label={<span>所属网关&nbsp;<Tooltip title="设备将要附属在哪个网关下边，一个设备只能从属于一个网关"><QuestionCircleOutlined /></Tooltip></span>}
                         name="gatewayId" initialValue={client.gatewayId}  rules={[{required: true, message: '请选择网关'}]} {...this.formItemLayout}>
                <Select placeholder="请选择网关类型" onChange={this.gateWaySelectChange} allowClear>
                  {gatewaySelectData}
                </Select>
              </Form.Item>
              <Form.Item label={<span>设备序号&nbsp;<Tooltip title="设备在网关下的下标号，用于网关和设备通信进行数据交换"><QuestionCircleOutlined /></Tooltip></span>}
                         name="serialNum" initialValue={client.serialNum} rules={[{required: true, message: '请选择序号'}]} {...this.formItemLayout}>
                <Radio.Group buttonStyle="solid">
                  {availableSerialNum}
                </Radio.Group>
              </Form.Item>
            </Card>
            <Card title="产品信息" bordered={false}>
              <Form.Item label={<span>产品类型&nbsp;<Tooltip title="设备所属产品类型，不同的产品，各自物模型各有不同"><QuestionCircleOutlined /></Tooltip></span>}
                         name="productId" initialValue={client.productId}  rules={[{required: true, message: '请选择产品'}]} {...this.formItemLayout}>
                <Select placeholder="请选择产品" allowClear>
                  {productSelectData}
                </Select>
              </Form.Item>
            </Card>
            <Card title="设备信息" bordered={false}>
              <Form.Item label="设备名："  name="name" initialValue={client.name || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                         rules={[{required: true, message: '请输入设备名'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
                <Input placeholder='例如：郁金香温湿度采集'/>
              </Form.Item>
              <Form.Item label={<span>启用状态&nbsp;<Tooltip title="设备是否允许连接平台。选择关闭后，平台对该设备的数据将冷处理。对于来自该设备的数据将不再处理，也不会向该设备发送任何指令"><QuestionCircleOutlined /></Tooltip></span>}
                         name="enable" initialValue={client.enable || 1} rules={[{required: true, message: '请选择状态'}]} {...this.formItemLayout}>
                <Radio.Group>
                  <Radio value={1}>启用</Radio>
                  <Radio value={2}>关闭</Radio>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Form>
        </Modal>
    );
  }
}

// 对外暴露
export default EditClient;
