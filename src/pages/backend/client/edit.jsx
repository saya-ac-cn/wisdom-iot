import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {Form, Input, Card, Tooltip, Select, Radio} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getIotGatewayList,getIotProductList,getAvailableSerialNum} from '../../../api'
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
    gatewaySelectData: [],// 系统返回的网关设备类别
    productSelectData:[],// 系统返回的产品列表
    availableSerialNum:[]// 系统返回的可用设备序号
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    // const { data } = this.state
    // const newdata = nextProps.data.toString()
    // if (data.toString() !== newdata) {
    //   this.setState({
    //     data: nextProps.data,
    //   })
    // }
  }

  /**
   * 设置参数传递是否为空，数据类型等要求属性：
   * @type {{setForm: (*|Validator<NonNullable<T>>|(() => any))}}
   */
  static propTypes = {
    client: PropTypes.object,// 要修改的接口信息，用于回显
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

  gateWaySelectChange = async (val) => {
    let _this = this;
    if (!val){
      _this.setState({
        availableSerialNum:[]
      });
      return
    }
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

  getSerialNumRadioData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    console.log(_this.props.client)
    //const {msg, code, data} = await getAvailableSerialNum(_this.props.client.gatewayId);
    // if (code === 0) {
    //   // 利用更新状态的回调函数，渲染下拉选框
    //   let productSelectData = [];
    //   data.forEach(item => {
    //     if()
    //     productSelectData.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
    //   });
    //   _this.setState({
    //     productSelectData
    //   });
    // } else {
    //   openNotificationWithIcon("error", "错误提示", msg);
    // }
  };

  componentWillMount () {
    // 初始化下拉列表数据
    this.getGateWaySelectData();
    this.getProductSelectData();
    const {client} = this.props;
    if (client) {
      // 初始化一次
      console.log(client);
    }
    this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18},
    };
  }


  render() {
    const {gatewaySelectData,productSelectData,availableSerialNum} = this.state;
    const {client} = this.props;
    return (
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
    );
  }
}

// 对外暴露
export default EditClient;
