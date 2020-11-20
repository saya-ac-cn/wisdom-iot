import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {Form, Input, Card, Tooltip, Select, Button,Radio} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getIotGatewayType, editIotGateway} from '../../../api'
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
class EditGateWay extends Component {

  formRef = React.createRef();


  state = {
    gatewayType: [],// 系统返回的设备类别
    infoLoading: false,// 提交修改网关信息后，按钮显示加载样式
    passwordLoading: false// 提交修改密码后，按钮显示加载样式
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

  /**
   * 提交表单，修改密码
   */
  handleEditPassword = (e) => {
    e.preventDefault();
    let _this = this;
    let {gateWay} = _this.props;
    _this.formRef.current.validateFields(["authenPassword"])
      .then( async (values) => {
        let para = {
          id: gateWay.id,
          authenInfo: {password:values.authenPassword}
        }
        _this.setState({passwordLoading: true});
        const {msg, code} = await editIotGateway(para);
        _this.setState({passwordLoading: false});
        if (code === 0) {
          openNotificationWithIcon("success", "操作结果", "密码修改成功");
        } else {
          openNotificationWithIcon("error", "错误提示", msg);
        }
      }).catch(errorInfo => {
      console.log(errorInfo)
    });
  }

  /**
   * 提交表单，修改网关信息
   */
  handleEditGateWay = (e) => {
    e.preventDefault();
    let _this = this;
    let {gateWay} = _this.props;
    _this.formRef.current.validateFields(["gatewayEnable","authenUserName","gatewayName","gatewayAddress","gatewayType"])
      .then( async (values) => {
        let para = {
          id: gateWay.id,
          name: values.gatewayName,
          address: values.gatewayAddress,
          deviceType: values.gatewayType,
          authenInfo: {username:values.authenUserName,enable:values.gatewayEnable}
        }
        _this.setState({infoLoading: true});
        const {msg, code} = await editIotGateway(para);
        _this.setState({infoLoading: false});
        if (code === 0) {
          openNotificationWithIcon("success", "操作结果", "网关修改成功");
        } else {
          openNotificationWithIcon("error", "错误提示", msg);
        }
      }).catch(errorInfo => {
      console.log(errorInfo)
    });
  }

  componentWillMount () {
    // 初始化网关类别数据
    this.getTypeData();
    this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 14},
    };
    this.buttonItemLayout = {
      wrapperCol: {span: 14, offset: 4},
    };
  }

  render() {
    const {gateWay} = this.props;
    const {gatewayType, passwordLoading, infoLoading} = this.state;
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.account) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    return (
      <Form {...this.formItemLayout} ref={this.formRef}>
        <Card title="接入凭证" bordered={false}>
          <Form.Item label={<span>设备名称&nbsp;<Tooltip title="设备名称是您的设备在平台中的唯一标识，用于连接时授权认证"><QuestionCircleOutlined /></Tooltip></span>}
                     name="authenUserName" initialValue={gateWay.authenUserName || `iot-${(user.account)}-${new Date().getTime()}`}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                     rules={[{required: true, message: '请输入设备名称'},{min: 6, message: '长度在 6 到 30 个字符'},{max: 30, message: '长度在 6 到 30 个字符'}]} {...this.formItemLayout}>
            <Input disabled={true} placeholder='请输入设备名称'/>
          </Form.Item>
          <Form.Item label={<span>认证密钥&nbsp;<Tooltip title="认证密钥将作为您的网关连接服务器的凭证，每个网关都有独立的认证密钥"><QuestionCircleOutlined /></Tooltip></span>}
            name="authenPassword" initialValue={gateWay.authenPassword || ""} getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                     rules={[{required: true, message: '请输入认证密钥'},{min: 6, message: '长度在 6 到 15 个字符'},{max: 15, message: '长度在 6 到 15 个字符'}]} {...this.formItemLayout}>
            <Input type="password" placeholder='请输入认证密钥'/>
          </Form.Item>
          <Form.Item {...this.buttonItemLayout}>
            <Button type="primary" htmlType="submit" loading={passwordLoading} onClick={e => this.handleEditPassword(e)}>
              修改密码
            </Button>
          </Form.Item>
        </Card>
        <Card title="网关信息" bordered={false}>
          <Form.Item label={<span>是否启用&nbsp;<Tooltip title="网关是否可以连接服务器进行认证"><QuestionCircleOutlined /></Tooltip></span>}
                     name="gatewayEnable" initialValue={gateWay.gatewayEnable || 1}  rules={[{required: true, message: '请选择是否启用'}]} {...this.formItemLayout}>
            <Radio.Group>
              <Radio value={1}>已启用</Radio>
              <Radio value={2}>已禁用</Radio>
            </Radio.Group>
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
            <Select placeholder="请选择网关类型" allowClear>
              {gatewayType}
            </Select>
          </Form.Item>
          <Form.Item {...this.buttonItemLayout}>
            <Button type="primary" htmlType="submit" loading={infoLoading} onClick={e => this.handleEditGateWay(e)}>
              修改网关
            </Button>
          </Form.Item>
        </Card>
      </Form>
    );
  }
}

// 对外暴露
export default EditGateWay;
