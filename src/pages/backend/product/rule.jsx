import React, { Component } from 'react';
import {Input, Select, Modal, Form, Card, Tooltip, InputNumber, Radio} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {clearTrimValueEvent} from "../../../utils/string";
import {addIotWarringRule,editIotWarringRule} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";

/*
 * 文件名：rule.jsx
 * 作者：liunengkai
 * 创建日期：4/18/21 - 6:53 PM
 * 描述：编辑告警规则
 */
const {Option} = Select;

// 定义组件（ES6）
class EditWaringRule extends Component {

    formRef = React.createRef();

    state = {
        visibleModal:false,
        // 第二阈值是否为范围运算符
        value2RequireFlag:false,
        // 联动告警下发指令是否是必须（当选框为请选择时，可不填）
        commandRequireFlag:false,
        // 用户可选择的物模型字段
        propertySelect:[],
        // 当前产品下的物模型(下拉选框)
        abilitySelect:[],
        // 当前告警规则
        rule:{},
        // 比较符号
        ruleOperations:[]
    };

    handleDisplay = (val) => {
        let _this = this;
        let {rule,abilities,warrings} = val;
        let propertySelect = [];
        let abilitySelect = [];
        let value2RequireFlag = false;
        let commandRequireFlag = false;
        if(abilities){
            abilitySelect.push((<Option key='-1' value='-1'>请选择</Option>));
            for(let key  in abilities){
                const item = abilities[key];
                abilitySelect.push((<Option key={item.property} value={item.property}>{item.name}</Option>));
            }
        }
        // 页面传入的物模型和告警列表均有值
        if (abilities&&warrings){
            // 把已经设置过的物模型剔除
            propertySelect = abilities.reduce((pre, abilitiesItem) => {
                if(!warrings.find(warringItem => warringItem.abilityId === abilitiesItem.id)){
                    pre.push((<Option key={abilitiesItem.id} value={abilitiesItem.id}>{abilitiesItem.name}</Option>));
                }
                return pre
            },[]);
        }
        // 页面传入的物模型有值但告警列表均没有值，此时直接把物模型列表放入用户可选的选框数据中
        if (abilities&&!warrings){
            // 把已经设置过的物模型剔除
            propertySelect = abilities.reduce((pre, abilitiesItem) => {
                pre.push((<Option key={abilitiesItem.id} value={abilitiesItem.id}>{abilitiesItem.name}</Option>));
                return pre
            },[]);
        }
        let flag = (!rule || !rule.id || -1 === rule.id);
        if (!flag){
            // 如果是修改，记得把当前告警关联的物模型添加进去
            let currentAbility =abilities.find(item => item.id === rule.abilityId);
            if (currentAbility && null !== currentAbility){
                propertySelect.push((<Option key={currentAbility.id} value={currentAbility.id}>{currentAbility.name}</Option>));
            }
            // 对于当前已经是范围告警，以及当前已经选择了联动字段，第二输入框和联动指令框需要有值
            if ('-1' !== rule.eventAttribute){
                commandRequireFlag = true
            }
            if ('RANGE' === rule.symbol){
                value2RequireFlag = true
            }
        }
        _this.setState({
            rule: rule,
            visibleModal: true,
            propertySelect:propertySelect,
            abilitySelect:abilitySelect,
            commandRequireFlag:commandRequireFlag,
            value2RequireFlag:value2RequireFlag
        },()=> {
            if(flag){
                // 避坑：不同的antd版本，可能有差异
                _this.formRef.current.setFieldsValue({'abilityId':null, 'name':null,'symbol':null,'value1':0,'value2':null,'enable':1});
            }else{
                //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
                _this.formRef.current.setFieldsValue(rule);
            }
        });
    };

    handleCancel = () => {
        this.setState({visibleModal: false});
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
     * 比较运算符号选择器发送变化
     * @param e
     */
    onSymbolChange = (e) => {
        if ('RANGE' === e){
            this.setState({value2RequireFlag: true});
        }else{
            this.setState({value2RequireFlag: false});
        }
    };

    /**
     * 物模型字段选择器发送变化
     * @param e
     */
    onAbilityChange = (e) => {
        if (-1 !== e || '-1' !== e){
            this.setState({commandRequireFlag: true});
        }else{
            this.setState({commandRequireFlag: false});
        }
    };

    handleSubmit = async () => {
        const _this = this;
        let checkFiles = ['abilityId', 'name','symbol','value1','enable','eventAttribute'];
        if (_this.state.value2RequireFlag){
            checkFiles.push('value2')
        }
        if (_this.state.commandRequireFlag){
            checkFiles.push('eventValue')
        }
        _this.formRef.current.validateFields(checkFiles).then(value => {
            const rule = _this.state.rule;
            let param = {
                abilityId:value.abilityId,
                name:value.name,
                symbol:value.symbol,
                value1:value.value1,
                enable:value.enable,
                productId:rule.productId
            };
            if (_this.state.value2RequireFlag){
                param.value2=value.value2
            }else {
                param.value2=0;
            }
            if (_this.state.commandRequireFlag){
                param.eventAttribute=value.eventAttribute;
                param.eventValue=value.eventValue
            }else {
                param.eventAttribute=-1;
                param.eventValue=''
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
        _this.props.onRef(_this);
        _this.getRuleOperation();
        _this.formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        };
    };

    render() {
      const {rule,visibleModal,propertySelect,ruleOperations,value2RequireFlag,commandRequireFlag,abilitySelect} = this.state;
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
                  <Card title="告警字段" bordered={false}>
                      <Form.Item label={<span>字段&nbsp;<Tooltip title="告警字段来源于本产品下的物模型，已经设置过的字段不能重复执行。告警规则将对该字段进行判断"><QuestionCircleOutlined /></Tooltip></span>}
                                 name="abilityId" initialValue={!rule || !rule.abilityId ? '' :rule.abilityId} rules={[{required: true, message: '请选择字段'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择字段" allowClear>
                              {propertySelect}
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
                  <Card title="事件联动" bordered={false}>
                      <Form.Item label={<span>指令&nbsp;<Tooltip title="触发告警后，将向这个功能指令下发的指令值"><QuestionCircleOutlined /></Tooltip></span>}
                      name="eventAttribute" initialValue={!rule || !rule.eventAttribute ? '-1' :rule.eventAttribute} rules={[{required:true,message: '请选择指令'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择联动指标" onChange={this.onAbilityChange}>
                            {abilitySelect}
                          </Select>
                      </Form.Item>
                      <Form.Item label={<span>指令值&nbsp;<Tooltip title="触发告警后，将向这个功能指令下发的指令值"><QuestionCircleOutlined /></Tooltip></span>}  name="eventValue" initialValue={!rule || !rule.eventValue ? '' :rule.eventValue}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                                 rules={[{required:commandRequireFlag,message: '请填写触发告警后下发的指令'},{min: 1, message: '长度在 1 到 6 个字符'},{max: 6, message: '长度在 1 到 6 个字符'}]} {...this.formItemLayout}>
                          <Input placeholder='例如：0'/>
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