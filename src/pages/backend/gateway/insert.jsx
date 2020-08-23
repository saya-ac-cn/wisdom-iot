import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {Form, Input, Card, Tooltip, Select} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getIotGatewayType} from '../../../api'
import {openNotificationWithIcon} from "../../../utils/window";
import memoryUtils from "../../../utils/memoryUtils";
import {clearTrimValueEvent} from "../../../utils/string";
import {Redirect} from "react-router-dom";
/*
 * 文件名：insert.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：编辑网关
 */
const { Option } = Select;
// 定义组件（ES6）
class AddGateWay extends Component {

  formRef = React.createRef();

  state = {
    gatewayType: []// 系统返回的设备类别
  }

  /**
   * 获取网关类别
   * @returns {Promise<void>}
   */
  getTypeData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotGatewayType();
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      let gatewayType = [];
      gatewayType.push((<Option key={-1} value="">请选择</Option>));
      data.forEach(item => {
        gatewayType.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
      });
      _this.setState({
        gatewayType
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 设置参数传递是否为空，数据类型等要求属性：
   * @type {{setForm: (*|Validator<NonNullable<T>>|(() => any))}}
   */
  static propTypes = {
    gateWay: PropTypes.object,// 要修改的接口信息，用于回显
  };

  componentWillMount () {
    // 初始化网关类别数据
    this.getTypeData();
    this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 14},
    };
  }

  render() {
    const {gateWay} = this.props;
    const {gatewayType} = this.state;
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.user) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    return (
      <Form {...this.formItemLayout} ref={this.formRef}>
        <Card title="接入凭证" bordered={false}>
          <Form.Item label={<span>认证密钥&nbsp;<Tooltip title="认证密钥将作为您的网关连接服务器的凭证，每个网关都有独立的认证密钥"><QuestionCircleOutlined /></Tooltip></span>}
            name="authenPassword" initialValue={gateWay.authenPassword || ""} getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                     rules={[{required: true, message: '请输入认证密钥'},{min: 6, message: '长度在 6 到 15 个字符'},{max: 15, message: '长度在 6 到 15 个字符'}]} {...this.formItemLayout}>
            <Input type="password" placeholder='请输入认证密钥'/>
          </Form.Item>
        </Card>
        <Card title="网关信息" bordered={false}>
          <Form.Item label={<span>网关编码&nbsp;<Tooltip title="网关编码是您的设备在平台中的唯一表示"><QuestionCircleOutlined /></Tooltip></span>}
             name="gatewayCode" initialValue={gateWay.gatewayCode || `IOT${(user.user.user).toUpperCase()}${new Date().getTime()}`}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                     rules={[{required: true, message: '请输入网关编码'},{min: 6, message: '长度在 6 到 30 个字符'},{max: 30, message: '长度在 6 到 30 个字符'}]} {...this.formItemLayout}>
            <Input disabled={true} placeholder='请输入网关编码'/>
          </Form.Item>
          <Form.Item label="网关名："  name="gatewayName" initialValue={gateWay.gatewayName || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
             rules={[{required: true, message: '请输入网关名'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
            <Input placeholder='例如：阳台-郁金香监测'/>
          </Form.Item>
          <Form.Item label="网关地址："  name="gatewayAddress" initialValue={gateWay.gatewayAddress || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
             rules={[{required: true, message: '请输入网关地址'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
            <Input placeholder='例如：阳台-空调下'/>
          </Form.Item>
          <Form.Item label={<span>网关类型&nbsp;<Tooltip title="请根据您的网关类型进行选择"><QuestionCircleOutlined /></Tooltip></span>}
                     name="gatewayType" initialValue={gateWay.gatewayType}  rules={[{required: true, message: '请选择网关类型'}]} {...this.formItemLayout}>
            <Select
              placeholder="请选择网关类型"
              onChange={this.onGenderChange}
              allowClear
            >
              {gatewayType}
            </Select>
          </Form.Item>
        </Card>
      </Form>
    );
  }
}

// 对外暴露
export default AddGateWay;