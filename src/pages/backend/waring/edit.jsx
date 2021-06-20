import React, { Component } from 'react';
import {Input, Select, Modal, Form, Card, Tooltip, InputNumber, Radio} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {clearTrimValueEvent} from "../../../utils/string";
import {addIotWarringRule, getIotSymbolUnits,editIotWarringRule} from "../../../api";
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
        // 是否显示加载
        listLoading: false,
        visibleModal:false,
        value2RequireFlag:false,
        //clientSelectData: [],// 系统返回的设备类别
        symbolUnitsOption:[],
        ruleOperations:[]
    };

    handleDisplay = (val) => {
        let _this = this;
        _this.setState({
            rule: val,
            visibleModal: true
        },function () {
            if(!val || !val.id || -1 === val.id){
                // 避坑：不同的antd版本，可能有差异
                _this.formRef.current.setFieldsValue({'units':null, 'name':null,'symbol':null,'value1':0,'value2':null,'enable':1});
            }else{
                //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
                _this.formRef.current.setFieldsValue(val);
            }
        });
    };

    handleCancel = () => {
        this.setState({visibleModal: false});
    };

    /**
     * 获取设备列表
     * @returns {Promise<void>}
     */

    // getClientSelectData = async () => {
    //     let _this = this;
    //     // 发异步ajax请求, 获取数据
    //     const {msg, code, data} = await getClientSelectList({keyWord:''});
    //     if (0 === code) {
    //         // 利用更新状态的回调函数，渲染下拉选框
    //         let clientSelectData = [];
    //         clientSelectData.push((<Option key={-1} value="">请选择</Option>));
    //         data.forEach(item => {
    //             clientSelectData.push((<Option key={item.id} value={item.id}>{`${item.name}(${item.gateway.name})`}</Option>));
    //         });
    //         _this.setState({
    //             clientSelectData
    //         });
    //     } else {
    //         openNotificationWithIcon("error", "错误提示", msg);
    //     }
    // };

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
        ruleOperations.push((<Option key='-1' value="">请选择</Option>));
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

    /**
     * 符号选择器发送变化
     * @param e
     */
    onSymbolChange = (e) => {
        if ('RANGE' === e){
            this.setState({value2RequireFlag: true});
        }else{
            this.setState({value2RequireFlag: false});
        }
    };

    handleSubmit = async () => {
        const _this = this;
        let checkFiles = ['units', 'name','symbol','value1','enable'];
        if (_this.state.value2RequireFlag){
            checkFiles.push('value2')
        }
        _this.formRef.current.validateFields(checkFiles).then(value => {
            const rule = _this.state.rule;
            let param = {
                units:value.units,
                name:value.name,
                symbol:value.symbol,
                value1:value.value1,
                enable:value.enable
            };
            if (_this.state.value2RequireFlag){
                param.value2=value.value2
            }else {
                param.value2=0;
            }
            if(!rule || !rule.id || -1 === rule.id){
                // 添加
                _this.handleInsert(param);
            }else{
                param.id=rule.id;
                _this.handleUpdate(param)
            }
        })
    };

    handleInsert = async (param) => {
        let _this = this;
        const {msg, code, data} = await addIotWarringRule(param);
        if (code === 0) {
            _this.formRef.current.resetFields();
            _this.props.refreshList();
            openNotificationWithIcon("success", "操作结果", "添加成功");
            _this.handleCancel();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    handleUpdate = async (param) => {
        let _this = this;
        const {msg, code, data} = await editIotWarringRule(param);
        if (code === 0) {
            _this.formRef.current.resetFields();
            _this.props.refreshList();
            openNotificationWithIcon("success", "操作结果", "修改成功");
            _this.handleCancel();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 初始化页面配置信息
     */
    componentDidMount() {
        // 加载页面数据
        const _this = this;
        // 初始化设备下拉列表数据
        _this.props.onRef(_this);
        //this.getClientSelectData();
        // 物理量
        _this.getIotSymbolUnits();
        _this.getRuleOperation();
        _this.formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        };
    };

    render() {
      const {rule,visibleModal,symbolUnitsOption,ruleOperations,value2RequireFlag} = this.state;
      return (
          <Modal
              title={!rule||-1===rule.id?'创建告警规则':'编辑告警规则'}
              width="50%"
              visible={visibleModal}
              onOk={() => this.handleSubmit()}
              onCancel={() => this.handleCancel()}
              cancelText='取消'
              okText='保存'>
              <Form {...this.formItemLayout} ref={this.formRef}>
                  {/*<Card title="设备信息" bordered={false}>*/}
                      {/*<Form.Item label={<span>设备&nbsp;<Tooltip title="告警的规则将要作用在哪个设备上"><QuestionCircleOutlined /></Tooltip></span>}*/}
                                 {/*name="clientId" initialValue={!rule || !rule.clientId ? '' :rule.clientId} rules={[{required: true, message: '请选择网关'}]} {...this.formItemLayout}>*/}
                          {/*<Select placeholder="请选择设备" allowClear>*/}
                              {/*{clientSelectData}*/}
                          {/*</Select>*/}
                      {/*</Form.Item>*/}
                  {/*</Card>*/}
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
                                 rules={[{required: true, message: '请输入告警名'},{min: 6, message: '长度在 6 到 20 个字符'},{max: 20, message: '长度在 6 到 20 个字符'}]} {...this.formItemLayout}>
                          <Input placeholder='例如：郁金香温定时浇水'/>
                      </Form.Item>
                      <Form.Item label='比较运算符号' name="symbol" initialValue={!rule || !rule.symbol ? '' :rule.symbol} rules={[{required: true, message: '请选择符号'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择符号" onChange={this.onSymbolChange}>
                              {ruleOperations}
                          </Select>
                      </Form.Item>
                      <Form.Item label={<span>第一阈值&nbsp;<Tooltip title="当比较运算符不是范围区间时，第一阈值将参与比较，第二阈值不参与比较；当运算符是范围区间时，第一阈值将作为左闭区间比较"><QuestionCircleOutlined /></Tooltip></span>}  name="value1" initialValue={!rule || !rule.value1 ? 0 :rule.value1}
                                 rules={[{required: true, message: '请输入第一阈值'}]} {...this.formItemLayout}>
                          <InputNumber min={0} max={999}/>
                      </Form.Item>
                      <Form.Item label={<span>第二阈值&nbsp;<Tooltip title="仅当运算符是范围区间时，第一阈值将作为左闭区间比较，第二阈值将作为右闭区间比较。非范围运算符时，第二阈值不参与比较"><QuestionCircleOutlined /></Tooltip></span>}  name="value2" initialValue={!rule || !rule.value2 ? 0 :rule.value2}
                                 rules={[{required: value2RequireFlag, message: '请输入第二阈值'}]} {...this.formItemLayout}>
                          <InputNumber min={0} max={999}/>
                      </Form.Item>
                  </Card>
                  <Card title='数据状态' bordered={false}>
                      <Form.Item label={<span>启用状态&nbsp;<Tooltip title="该规则是否启用。选择关闭后，平台对绑定了该规则的设备将冷处理。对于来自该设备的数据将不会产生任何告警"><QuestionCircleOutlined /></Tooltip></span>}
                                 name="enable" initialValue={!rule || !rule.enable ? 1 :rule.enable} rules={[{required: true, message: '请选择状态'}]} {...this.formItemLayout}>
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
export default EditWaringRule;