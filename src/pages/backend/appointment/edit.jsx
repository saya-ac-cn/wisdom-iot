import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {Form, Input, Card, Tooltip, Select, InputNumber,DatePicker} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {getClientSelectList} from '../../../api'
import {openNotificationWithIcon} from "../../../utils/window";
import {clearTrimValueEvent} from "../../../utils/string";
import moment from 'moment';

/*
 * 文件名：edit.jsx
 * 作者：saya
 * 创建日期：2020/9/20 - 3:53 下午
 * 描述：
 */
const { Option } = Select;
// 定义组件（ES6）
class EditAppointment extends Component {

  formRef = React.createRef();

  state = {
    clientSelectData: [],// 系统返回的设备类别
  }

  /**
   * 设置参数传递是否为空，数据类型等要求属性：
   * @type {{setForm: (*|Validator<NonNullable<T>>|(() => any))}}
   */
  static propTypes = {
    appointment: PropTypes.object,// 要修改的接口信息，用于回显
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
        clientSelectData.push((<Option key={item.id} value={item.id}>{`${item.name}(${item.gateway.name})`}</Option>));
      });
      _this.setState({
        clientSelectData
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  componentWillMount () {
    // 初始化设备下拉列表数据
    this.getClientSelectData();
    this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 14},
    };
  }

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }


  disabledDate = (current) => {
    // Can not select days before today and today
    // moment().endOf('day')
    return current && current < moment().subtract(1, 'days').endOf('day');
  }

  disabledDateTime = () => {
    return {
      disabledHours: () => this.range(0, 24).splice(0, moment().add(1, 'hours').get('hours')),
      disabledMinutes: () => this.range(60, 0),
      disabledSeconds: () => this.range(60, 0),
    };
  }


  render() {
    const {clientSelectData} = this.state;
    const {appointment} = this.props;
    return (
      <Form {...this.formItemLayout} ref={this.formRef}>
        <Card title="设备信息" bordered={false}>
          <Form.Item label={<span>设备&nbsp;<Tooltip title="预约的指令将要作用在哪个设备上"><QuestionCircleOutlined /></Tooltip></span>}
                     name="clientId" initialValue={appointment.clientId || ""} rules={[{required: true, message: '请选择网关'}]} {...this.formItemLayout}>
            <Select placeholder="请选择设备" allowClear>
              {clientSelectData}
            </Select>
          </Form.Item>
        </Card>
        <Card title="预约信息" bordered={false}>
          <Form.Item label="预约名："  name="name" initialValue={appointment.name || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                     rules={[{required: true, message: '请输入预约名'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
            <Input placeholder='例如：郁金香温定时浇水'/>
          </Form.Item>
          <Form.Item label={<span>指令&nbsp;<Tooltip title="到指定时间后，平台将下发到设备的指令，请参照设备可接收指令"><QuestionCircleOutlined /></Tooltip></span>}  name="command" initialValue={appointment.command || 1}
                     rules={[{required: true, message: '请输入指令'}]} {...this.formItemLayout}>
            <InputNumber placeholder='1' min={0} max={999}/>
          </Form.Item>
          <Form.Item label={<span>执行时间&nbsp;<Tooltip title="您的指令将在何时触发"><QuestionCircleOutlined /></Tooltip></span>}  name="excuteTime" initialValue={!appointment.excuteTime?null:moment(appointment.excuteTime)}
                     rules={[{required: true, message: '请选择执行时间'}]} {...this.formItemLayout}>
            <DatePicker format="YYYY-MM-DD HH:mm:ss" showNow={false} disabledDate={this.disabledDate} disabledTime={this.disabledDateTime} showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} renderExtraFooter={() => '只能选择当前日期时间后1个小时及其以后的日期'}/>
          </Form.Item>
        </Card>
      </Form>
    );
  }
}

// 对外暴露
export default EditAppointment;
