import React, { Component } from 'react';
import {Form, Modal, Tooltip, InputNumber,Select} from "antd";
import memoryUtils from "../../../utils/memoryUtils";
import {Redirect} from "react-router-dom";
import {getClientEnableString} from "../../../utils/enum";
import "./index.less"
import {QuestionCircleOutlined} from "@ant-design/icons";
import {clearTrimValueEvent} from "../../../utils/string";
/*
 * 文件名：command.jsx
 * 作者：saya
 * 创建日期：2020/8/19 - 9:24 下午
 * 描述：下发指令
 */
const {Option} = Select;

// 定义组件（ES6）
class CommandModal extends Component {

  formRef = React.createRef();

  state = {
    ability:{},
    visibleModal:false,
    // 动态命令输入框，通过物模型进行切换
    dynamicCommand: <InputNumber/>,
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
      ability: val,
      visibleModal: true
    },()=>{
      _this.initAbilityForm(val);
    });
  };

  /**
   * 初始化指令发送表单
   */
  initAbilityForm = (ability) => {
    const _this = this;
    const scope = ability.scopeParam;
    _this.formRef.current.setFieldsValue({command: null});
    if ((ability.type) && (1 === ability.type)) {
      // 单一值类型
      const min = Number.parseFloat(ability.scopeParam.beginThreshold);
      const max = Number.parseFloat(ability.scopeParam.endThreshold);
      _this.setState({dynamicCommand: <div><InputNumber min={min} max={max} style={{width:'12em'}}/><span style={{color:'#ff4d4f',marginLeft:'1em'}}>阈值范围[{min},{max}]</span></div>});
    } else {
      // 枚举类型
      const status = scope.status;
      let options = [];
      for (let key in status) {
        options.push(<Option key={key} value={key}>{status[key]}</Option>);
      }
      _this.setState({dynamicCommand: <Select>{options}</Select>});
    }
  };

  /**
   * 发送指令
   * @returns {Promise<void>}
   */
  handleSubmit = async () => {
    const _this = this;
    _this.formRef.current.validateFields(['command']).then(value => {
      console.log(value)
    })
  }

  /**
   * 为第一次render()准备数据
   * 因为要异步加载数据，所以方法改为async执行
   */
  componentDidMount() {
    const _this = this;
    _this.props.onRef(_this);
    _this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18},
    };
  };

  render() {
    const {ability,visibleModal, dynamicCommand} = this.state;

    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.account) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    return (
        <Modal title="下发指令"
                width="40%" visible={visibleModal} maskClosable={false} closable={true}
                onOk={() => this.handleSubmit()}
                onCancel={() => this.handleCancel()}
                cancelText='取消'
                okText='发送'>
          <Form {...this.formItemLayout} ref={this.formRef}>
            <Form.Item
                label={<span>{ability.name}&nbsp;<Tooltip title="一旦控制指令提交后，无法撤回！在特殊领域场合：如电源合闸，请确保在安全无误的前提下，执行控制！"><QuestionCircleOutlined/></Tooltip></span>}
                name="command" rules={[{required: true, message: '请填写或选择要下发的指令'}]} {...this.formItemLayout}>
              {dynamicCommand}
            </Form.Item>
          </Form>
        </Modal>
    );
  }
}

// 对外暴露
export default CommandModal;
