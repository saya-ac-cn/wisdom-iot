import React, { Component } from 'react';
import {Form, Input, Card, Tooltip, Select, Radio, Modal} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getProductList, addIotClient, editIotClient,getIotIdentify} from '../../../api'
import {openNotificationWithIcon} from "../../../utils/window";
import {clearTrimValueEvent,generateRandomStr,generateRandomFixedStr} from "../../../utils/string";
import memoryUtils from "../../../utils/memoryUtils";
import {Redirect} from "react-router-dom";

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
    identify:{username:"",password: ""},
    visibleModal:false,
    productSelectData:[],// 系统返回的产品列表
  };

  /**
   * 关闭弹框
   */
  handleCancel = () => {
    // 重置表单
    this.formRef.current.resetFields();
    this.setState({visibleModal: false});
  };


  /**
   * 显示弹框
   * @param val
   */
  handleDisplay = (val) => {
    let _this = this;
    if(!val || !val.id){
      const identify = {username:generateRandomFixedStr(generateRandomStr(),20),password: ""}
      _this.setState({
        client: val,
        identify: identify,
        visibleModal: true
      });
      // 踩坑，页面在第一次打开时，his.formRef.current为空，解决办法：设置Modal的forceRender=true（强制渲染Modal）
      _this.formRef.current.setFieldsValue({"authenUserName":identify.username,"authenPassword":null,"productId":null,"name":null,"enable":null});
    }else{
      // 获取相应的认证信息
      _this.getIotIdentifyData(val.identifyUuid)
      _this.setState({
        client: val,
        visibleModal: true
      });
      _this.formRef.current.setFieldsValue(val);
    }
  };


  /**
   * 响应用户提交事件
   */
  handleSubmit = () =>{
    const _this = this;
    const client = _this.state.client;
    _this.formRef.current.validateFields(["authenPassword","authenUserName","productId","name","enable"]).then(value => {
      if(!client.id){
        let para = {
          productId: value.productId,
          name: value.name,
          enable: value.enable,
          authenInfo: {username:value.authenUserName,password:value.authenPassword}
        };
        // 执行添加
        _this.handleAdd(para);
      }else{
        // 执行修改
        let para = {
          id: client.id,
          name: value.name,
          enable: value.enable,
          authenInfo: {username:value.authenUserName,password:value.authenPassword}
        };
        _this.handleRenew(para);
      }
    }).catch(e => console.log("修改或添加设备错误",e));
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
   * 获取产品类型
   * @returns {Promise<void>}
   */
  getProductSelectData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getProductList();
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
   * 获取设备认证信息
   * @returns {Promise<void>}
   */
  getIotIdentifyData = async (identifyUuid) => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotIdentify(identifyUuid);
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      const identify = {username:data.username,password: data.password}
      _this.setState({
        identify
      }, () =>{
        _this.formRef.current.setFieldsValue({"authenUserName":data.username,"authenPassword":data.password});
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  componentWillMount () {
    const _this = this;
    // 初始化下拉列表数据
    _this.getProductSelectData();
    _this.props.onRef(_this);
    _this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18},
    };
  }


  render() {
    const {productSelectData,client,visibleModal,identify} = this.state;
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.account) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    return (
        <Modal title={!client || !client.id ? '添加设备':'编辑设备'} forceRender={true} visible={visibleModal} maskClosable={false} width="60%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
          <Form {...this.formItemLayout} ref={this.formRef}>
            <Card title="接入凭证" bordered={false}>
              <Form.Item label={<span>认证编码&nbsp;<Tooltip title="认证编码是您的设备在平台中的唯一标识，用于连接时授权认证"><QuestionCircleOutlined /></Tooltip></span>}
                         name="authenUserName" initialValue={identify.username}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                         rules={[{required: true, message: '请输入设备名称'},{min: 6, message: '长度在 6 到 30 个字符'},{max: 30, message: '长度在 6 到 30 个字符'}]} {...this.formItemLayout}>
                <Input disabled={true} placeholder='请输入认证编码'/>
              </Form.Item>
              <Form.Item label={<span>认证密钥&nbsp;<Tooltip title="认证密钥将作为您的网关连接服务器的凭证，每个网关都有独立的认证密钥"><QuestionCircleOutlined /></Tooltip></span>}
                         name="authenPassword" initialValue={identify.password || ""} getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                         rules={[{required: true, message: '请输入认证密钥'},{min: 6, message: '长度在 6 到 15 个字符'},{max: 15, message: '长度在 6 到 15 个字符'}]} {...this.formItemLayout}>
                <Input type="password" placeholder='请输入认证密钥'/>
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
