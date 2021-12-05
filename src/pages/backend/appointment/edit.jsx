import React, { Component } from 'react';
import {Form, Input, Card, Tooltip, Select, Modal} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getClientSelectList, getProductAbilityList,addIotAppointment,editIotAppointment} from '../../../api'
import {openNotificationWithIcon} from "../../../utils/window";
import {clearTrimValueEvent} from "../../../utils/string";
import CronGenerator from './cron-generator'
/*
 * 文件名：edit_.jsx
 * 作者：saya
 * 创建日期：2020/9/20 - 3:53 下午
 * 描述：
 */
const { Option } = Select;
// 定义组件（ES6）
class EditAppointment extends Component {

  formRef = React.createRef();

  cronRef = React.createRef();

  state = {
    visibleModal:false,
    appointment:{},
    abilities:[],
    clientSelectData: [],// 系统返回的设备类别
    abilitySelect:[],
    // 动态命令输入框，通过物模型进行切换
    dynamicCommand:<Input/>,
  }

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
    let dynamicCommand = <Input/>;
    if (val && val.iotClient){
      // 加入是修改，并且查出了所属产品，那就把它的物模型拿出来以便于回显
      _this.getProductAbility(val.iotClient.productId);
    }
    if (val && val.iotAbility && 2 === val.iotAbility.type && val.iotAbility.scope){
      let scope = JSON.parse(val.iotAbility.scope);
      let options = [];
      for(let key in scope) {
        const id = parseInt(key);
        options.push(<Option key={id} value={id}>{scope[key]}</Option>);
      }
      dynamicCommand = <Select>{options}</Select>;
    }
    _this.setState({
      appointment: val,
      dynamicCommand: dynamicCommand,
      visibleModal: true
    },function () {
      //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
      if(!val || !val.code){
        _this.formRef.current.setFieldsValue({"clientId":null,"name":null,"abilityId":null,"gatewayAddress":null,"gatewayType":null});
      }else{
        console.log(val)
        //_this.getProductAbility(val.iotClient);
        _this.formRef.current.setFieldsValue(val);
      }
    });
  };

  /**
   * 获取设备列表
   * @returns {Promise<void>}
   */
  getClientSelectData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getClientSelectList({keyWord:''});
    if (0 === code) {
      // 利用更新状态的回调函数，渲染下拉选框
      let clientSelectData = [];
      clientSelectData.push((<Option key={-1} value="">请选择</Option>));
      data.forEach(item => {
        // 自定义的属性需要小写
        clientSelectData.push((<Option key={item.id} productid={item.productId} value={item.id}>{`${item.name}(${item.gateway.name})`}</Option>));
      });
      _this.setState({
        clientSelectData
      });
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
      let abilitySelect = [];
      abilitySelect.push((<Option key='-1' value='-1'>请选择</Option>));
      for(let key  in data){
        const item = data[key];
        abilitySelect.push((<Option key={item.id} ability={item} value={item.id}>{item.name}</Option>));
      }
      _this.setState({abilities: data,abilitySelect: abilitySelect});
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 当所选的设备发生变化，相应的物模型也需要变化
   * @param e
   * @param target
   */
  onClientChange = (e,target) => {
    this.getProductAbility(target.productid);
  };

  /**
   * 物模型字段选择器发送变化
   * @param e
   * @param target
   */
  onAbilityChange = (e,target) => {
    const _this = this;
    const ability = target.ability;
    const scope = ability.scopeParam;
    _this.formRef.current.setFieldsValue({command:null});
    if ((ability.type)&&(1===ability.type)) {
      //return `起始值:${scope.beginThreshold},结束值:${scope.endThreshold}`;
      _this.setState({dynamicCommand:<Input/>});
    }else{
      // 枚举类型
      const status = scope.status;
      let options = [];
      for(let key in status) {
        options.push(<Option key={key} value={key}>{status[key]}</Option>);
      }
      _this.setState({dynamicCommand:<Select>{options}</Select>});
    }
  };

  /**
   * 响应用户提交事件
   */
  handleSubmit = async () =>{
    const _this = this;
    const cron = _this.cronRef.getCron();
    if (!cron){
      openNotificationWithIcon("error", "错误提示", '无效的cron表达式');
      return
    }
    const appointment = _this.state.appointment;
    _this.formRef.current.validateFields(['clientId','name','abilityId','command']).then(value => {
      let para = {
        name: value.name,
        clientId:value.clientId,
        abilityId:value.abilityId,
        command:value.command,
        cron:cron
      };
      if(!appointment.code){
        // 执行添加
        _this.handleAdd(para);
      }else{
        // 执行修改
        para.code = appointment.code;
        _this.handleRenew(para);
      }
    }).catch(e => console.log("修改或添加产品错误",e));
  };

  /**
   * 提交表单，添加预约
   */
  handleAdd = async (param) => {
    let _this = this;
    const {msg, code} = await addIotAppointment(param)
    if (code === 0) {
      _this.formRef.current.resetFields();
      _this.props.refreshList();
      openNotificationWithIcon("success", "操作结果", "添加成功");
      _this.handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  }

  /**
   * 提交表单，修改预约
   */
  handleRenew = async (param) => {
    let _this = this;
    const {msg, code} = await editIotAppointment(param)
    _this.setState({listLoading: false});
    if (code === 0) {
      _this.formRef.current.resetFields();
      _this.props.refreshList();
      openNotificationWithIcon("success", "操作结果", "修改成功");
      _this.handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  }

  /**
   * cron绑定
   * @param ref
   */
  bindCornRef = (ref) => {
    this.cronRef = ref
  };


  componentDidMount () {
    const _this = this;
    // 初始化设备下拉列表数据
    _this.getClientSelectData();
    _this.props.onRef(_this);
    _this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 14},
    };
  }


  render() {
    const {clientSelectData,appointment,visibleModal,abilitySelect,dynamicCommand} = this.state;
    return (
      <Modal title={!appointment.code ? '创建调度计划':'编辑调度计划'} visible={visibleModal} maskClosable={false} width="50%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
        <Form {...this.formItemLayout} ref={this.formRef}>
          <Card title="设备信息" bordered={false}>
            <Form.Item label={<span>设备&nbsp;<Tooltip title="调度指令将要作用在哪个设备上"><QuestionCircleOutlined /></Tooltip></span>}
                       name="clientId" initialValue={appointment.clientId || ""} rules={[{required: true, message: '请选择设备'}]} {...this.formItemLayout}>
              <Select placeholder="请选择设备" onChange={this.onClientChange} allowClear>
                {clientSelectData}
              </Select>
            </Form.Item>
          </Card>
          <Card title="调度指令" bordered={false}>
            <Form.Item label="调度名："  name="name" initialValue={appointment.name || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                       rules={[{required: true, message: '请输入调度名'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
              <Input placeholder='例如：郁金香温定时浇水'/>
            </Form.Item>
            <Form.Item label={<span>指令名&nbsp;<Tooltip title="触发告警后，将向这个功能指令下发的指令值"><QuestionCircleOutlined /></Tooltip></span>}
                       name="abilityId" initialValue={!appointment || !appointment.abilityId ? '-1' :appointment.abilityId} rules={[{required:true,message: '请选择指令'}]} {...this.formItemLayout}>
              <Select placeholder="请选择指令名" onChange={this.onAbilityChange}>
                {abilitySelect}
              </Select>
            </Form.Item>
            <Form.Item label="指令值：" name="command" initialValue={appointment.command || ""}
                       rules={[{required: true, message: '请输入或者选择指令值'}]} {...this.formItemLayout}>
              {dynamicCommand}
            </Form.Item>
          </Card>
          <Card title="调度时间" bordered={false}>
            <CronGenerator onRef={this.bindCornRef.bind(this)} cron={!appointment || !appointment.cron ? '* * * * * *' :appointment.cron}/>
          </Card>
        </Form>
      </Modal>
    );
  }
}

// 对外暴露
export default EditAppointment;
