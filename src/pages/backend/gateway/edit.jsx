import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {Form, Input, Card} from "antd";

/*
 * 文件名：edit.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：编辑网关
 */

// 定义组件（ES6）
class EditGateWay extends Component {

  formRef = React.createRef();

  /**
   * 设置参数传递是否为空，数据类型等要求属性：
   * @type {{setForm: (*|Validator<NonNullable<T>>|(() => any))}}
   */
  static propTypes = {
    gateWay: PropTypes.object,// 要修改的接口信息，用于回显
  };

  componentWillMount () {
    this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 14},
    };
  }

  render() {
    const {gateWay} = this.props;
    return (
      <Form {...this.formItemLayout} ref={this.formRef}>
        <Card title="Card title" bordered={false}>
        <Form.Item label="笔记簿名："  name="name" initialValue={gateWay.name}  rules={[{required: true, message: '请输入笔记簿名'},{min: 2, message: '长度在 2 到 15 个字符'},{max: 15, message: '长度在 2 到 15 个字符'}]} {...this.formItemLayout}>
          <Input placeholder='请输入标题'/>
        </Form.Item>
        </Card>
      </Form>
    );
  }
}

// 对外暴露
export default EditGateWay;
