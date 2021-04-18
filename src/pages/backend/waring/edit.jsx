import React, { Component } from 'react';
import {Button, Col, Input, Select, Modal, Form, Card, Tooltip, InputNumber} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {clearTrimValueEvent} from "../../../utils/string";
import {getClientSelectList, getIotSymbolUnits} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";

/*
 * 文件名：edit.jsx
 * 作者：liunengkai
 * 创建日期：4/18/21 - 6:53 PM
 * 描述：修改告警规则
 */
const {Option} = Select;

// 定义组件（ES6）
class EditWaringRule extends Component {

    formRef = React.createRef();

    state = {
        // 返回的账单数据
        rule: null,
        // 是否显示加载
        listLoading: false,
        visibleModal:false,
        clientSelectData: [],// 系统返回的设备类别
        symbolUnitsOption:[],
        ruleOperations:[]
    };

    handleDisplay = (val) => {
        let _this = this;
        _this.setState({
            rule: val,
            visibleModal: true
        },function () {
            // 执行初始化加载页面的辅助数据
        });
    };

    handleCancel = () => {
        this.setState({visibleModal: false});
    };

    /**
     * 初始化页面配置信息
     */
    componentDidMount() {
        // 加载页面数据
        const _this = this;
        _this.props.onRef(_this);
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

    /**
     * 获取物理量
     * @returns {Promise<void>}
     */
    getIotSymbolUnits = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getIotSymbolUnits();
        if (code === 0) {
            // 利用更新状态的回调函数，渲染下拉选框
            let symbolUnitsOption = [];
            // 利用更新状态的回调函数，渲染下拉选框
            symbolUnitsOption.push((<Option key={-1} value="">请选择</Option>));
            for(let key  in data){
                symbolUnitsOption.push((<Option key={key} value={key}>{data[key]}</Option>));
            }
            _this.setState({
                symbolUnitsOption
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 构造基本运算比较符号
     */
    getRuleOperation = () => {
        let _this = this;
        let ruleOperations = [];
        ruleOperations.push((<Option key='-1' value="-1">请选择</Option>));
        ruleOperations.push((<Option key='EQ' value="EQ">等于</Option>));
        ruleOperations.push((<Option key='NEQ' value="NEQ">不等于</Option>));
        ruleOperations.push((<Option key='GT' value="GT">大于</Option>));
        ruleOperations.push((<Option key='GTE' value="GTE">大于等于</Option>));
        ruleOperations.push((<Option key='LT' value="LT">小于</Option>));
        ruleOperations.push((<Option key='LTE' value="LTE">小于等于</Option>));
        ruleOperations.push((<Option key='RANGE' value="RANGE">范围</Option>));
        _this.setState({
            ruleOperations
        });
    };

    componentWillMount () {
        // 初始化设备下拉列表数据
        this.getClientSelectData();
        // 物理量
        this.getIotSymbolUnits();
        this.getRuleOperation();
        this.formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        };
    }


    render() {
      const {rule, listLoading,visibleModal,clientSelectData,symbolUnitsOption,ruleOperations} = this.state;
      return (
          <Modal
              title={!rule||-1===rule.id?'创建告警规则':'编辑告警规则'}
              width="50%"
              visible={visibleModal}
              onOk={() => this.handleCancel()}
              onCancel={() => this.handleCancel()}
              cancelText='取消'
              okText='关闭'>
              <Form {...this.formItemLayout} ref={this.formRef}>
                  <Card title="设备信息" bordered={false}>
                      <Form.Item label={<span>设备&nbsp;<Tooltip title="告警的规则将要作用在哪个设备上"><QuestionCircleOutlined /></Tooltip></span>}
                                 name="clientId" initialValue={!rule || !rule.clientId ? '' :rule.clientId} rules={[{required: true, message: '请选择网关'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择设备" allowClear>
                              {clientSelectData}
                          </Select>
                      </Form.Item>
                  </Card>
                  <Card title="告警字段" bordered={false}>
                      <Form.Item label={<span>字段&nbsp;<Tooltip title="告警规则将对该字段进行判断"><QuestionCircleOutlined /></Tooltip></span>}
                                 name="units" initialValue={!rule || !rule.units ? '' :rule.units} rules={[{required: true, message: '请选择字段'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择字段" allowClear>
                              {symbolUnitsOption}
                          </Select>
                      </Form.Item>
                  </Card>
                  <Card title="告警规则" bordered={false}>
                      <Form.Item label="告警名："  name="name" initialValue={!rule || !rule.name ? '' :rule.name}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                                 rules={[{required: true, message: '请输入预约名'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
                          <Input placeholder='例如：郁金香温定时浇水'/>
                      </Form.Item>
                      <Form.Item label='比较运算符号' name="symbol" initialValue={!rule || !rule.symbol ? '-1' :rule.symbol} rules={[{required: true, message: '请选择符号'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择符号" allowClear>
                              {ruleOperations}
                          </Select>
                      </Form.Item>
                      <Form.Item label={<span>第一阈值&nbsp;<Tooltip title="当比较运算符不是范围区间时，第一阈值将参与比较，第二阈值不参与比较；当运算符是范围区间时，第一阈值将作为左闭区间比较"><QuestionCircleOutlined /></Tooltip></span>}  name="value1" initialValue={!rule || !rule.value1 ? 0 :rule.value1}
                                 rules={[{required: true, message: '请输入第一阈值'}]} {...this.formItemLayout}>
                          <InputNumber placeholder='1' min={0} max={999}/>
                      </Form.Item>
                      <Form.Item label={<span>第二阈值&nbsp;<Tooltip title="仅当运算符是范围区间时，第一阈值将作为左闭区间比较，第二阈值将作为右闭区间比较。非范围运算符时，第二阈值不参与比较"><QuestionCircleOutlined /></Tooltip></span>}  name="value2" initialValue={!rule || !rule.value2 ? 0 :rule.value2}
                                 rules={[{required: true, message: '请输入第二阈值'}]} {...this.formItemLayout}>
                          <InputNumber placeholder='1' min={0} max={999}/>
                      </Form.Item>
                  </Card>
              </Form>
          </Modal>
    );
  }
}

// 对外暴露
export default EditWaringRule;