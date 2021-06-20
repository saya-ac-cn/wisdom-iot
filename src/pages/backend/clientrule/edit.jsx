import React, { Component } from 'react';
import {Checkbox, Select, Modal, Form, Card, Tooltip, Row, Col} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {addIotWarringRule, addClientIotWarringRule,getIotSystemRule,getClientSelectList,editIotWarringRule} from "../../../api";
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
        clientSelectData: [],// 系统返回的设备类别
        enableRule:[],// 后台返回的可选规则
        alreadySelectRule:[],// 已选的规则
    };

    handleDisplay = (val) => {
        let _this = this;
        _this.setState({
            rule: val,
            visibleModal: true
        },function () {
            // if(!val || !val.id || -1 === val.id){
            //     // 避坑：不同的antd版本，可能有差异
            //     _this.formRef.current.setFieldsValue({'units':null, 'name':null,'symbol':null,'value1':0,'value2':null,'enable':1});
            // }else{
            //     //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
            //     _this.formRef.current.setFieldsValue(val);
            // }
        });
    };

    handleCancel = () => {
        this.setState({visibleModal: false});
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

    handleSubmit = async () => {
        const _this = this;
        let checkFiles = ['clientId'];
        _this.formRef.current.validateFields(checkFiles).then(value => {
            const rule = _this.state.rule;
            let param = {
                clientId:value.clientId,
                name:value.name,
            };
            if(!rule || !rule.id || -1 === rule.id){
                // 添加
                _this.handleInsert(value.clientId);
            }else{
                param.id=rule.id;
                _this.handleUpdate(param)
            }
        })
    };

    handleInsert = async (clientId) => {
        let _this = this;
        const rules = _this.state.alreadySelectRule;
        if (!rules || rules.length < 1){
            openNotificationWithIcon("error", "错误提示", "请选择告警规则");
            return;
        }
        const {msg, code, data} = await addClientIotWarringRule(clientId,rules);
        if (code === 0) {
            _this.formRef.current.resetFields();
            _this.props.refreshList();
            openNotificationWithIcon("success", "操作结果", "绑定成功");
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
     * 设备选择器发送变化
     * @param e
     */
    onClientChange = (e) => {
        this.getClientEnabelRule(e);
    };

    getClientEnabelRule = async (clientId) => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getIotSystemRule({clientId:clientId});
        if (code === 0) {
            // 利用更新状态的回调函数，渲染下拉选框
            let enableRule = [];
            // 利用更新状态的回调函数，渲染下拉选框
            for(let key  in data){
                const item = data[key]
                enableRule.push((<Col key={key} span={8}> <Checkbox value={item.id}>{item.name}</Checkbox></Col>));
            }
            _this.setState({
                enableRule
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    ruleChangeEvent = (checkedValues) => {
        this.setState({alreadySelectRule:checkedValues})
    };

    /**
     * 初始化页面配置信息
     */
    componentDidMount() {
        // 加载页面数据
        const _this = this;
        // 初始化设备下拉列表数据
        _this.props.onRef(_this);
        this.getClientSelectData();
        _this.formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        };
    };

    render() {
      const {rule,visibleModal,clientSelectData,enableRule} = this.state;
      return (
          <Modal
              title={!rule||-1===rule.id?'绑定告警规则':'修改告警绑定'}
              width="50%"
              visible={visibleModal}
              onOk={() => this.handleSubmit()}
              onCancel={() => this.handleCancel()}
              cancelText='取消'
              okText='保存'>
              <Form {...this.formItemLayout} ref={this.formRef}>
                  <Card title="设备信息" bordered={false}>
                      <Form.Item label={<span>设备&nbsp;<Tooltip title="告警的规则将要作用在哪个设备上"><QuestionCircleOutlined /></Tooltip></span>}
                                 name="clientId" initialValue={!rule || !rule.clientId ? '' :rule.clientId} rules={[{required: true, message: '请选择设备'}]} {...this.formItemLayout}>
                          <Select placeholder="请选择设备" onChange={this.onClientChange}>
                              {clientSelectData}
                          </Select>
                      </Form.Item>
                  </Card>
                  <Card title="关联规则" bordered={false}>
                      <Checkbox.Group style={{ width: '100%' }} onChange={this.ruleChangeEvent}>
                          <Row>
                             {enableRule}
                          </Row>
                      </Checkbox.Group>
                  </Card>
              </Form>
          </Modal>
    );
  }
}

// 对外暴露
export default EditWaringRule;