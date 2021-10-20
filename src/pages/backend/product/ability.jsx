import React, { Component } from 'react';
import {Form, Input, Card, Tooltip, Select, Radio, Modal,Space,Button} from "antd";
import {QuestionCircleOutlined,MinusCircleOutlined,PlusOutlined} from '@ant-design/icons';
import {getStandardList, addProductAbility, editProductAbility} from '../../../api'
import {openNotificationWithIcon} from "../../../utils/window";
import {clearTrimValueEvent} from "../../../utils/string";

/*
 * 文件名：edit.jsx
 * 作者：saya
 * 创建日期：2020/8/23 - 3:44 下午
 * 描述：修改或者添加物模型字段
 */
const { Option } = Select;

// 数值和枚举类型的样例数据
const singleValueTypeSimple = [{key:'begin',value:0},{key:'end',value:99999}];
const enumValueTypeSimple = [{key:'0',value:'开启'},{key:'1',value:'关闭'}];


// 定义组件（ES6）
class EditProductAbility extends Component {

  mainFormRef = React.createRef();


  state = {
    visibleModal:false,
    standardSelectData:[],// 系统返回的可用设备序号
    ability:{},
    enums:singleValueTypeSimple,
    // 当前已选择的数据类型（默认为数值类型）
    currentDataType:1
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
      currentDataType:val.type,
      visibleModal: true
    },function () {
      //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
      if(!val.id){
        _this.mainFormRef.current.setFieldsValue({"name":'',"property":null,"standardId":null,"rwFlag":1,"type":1,"scope":singleValueTypeSimple});
      }else{
        _this.mainFormRef.current.setFieldsValue(val);
      }
    });
  };


  /**
   * 响应用户提交事件
   */
  handleSubmit = () =>{
    const _this = this;
    const ability = _this.state.ability;
    _this.mainFormRef.current.validateFields(["name","property","standardId","rwFlag","type","scope"]).then(value => {
      // 进行数据校验&压缩
      let scope = {};
      for (let key in value.scope) {
        const item = value.scope[key];
        if (!item || null === item.key || null === item.value || '' === item.key || '' === item.value){
          return
        }
        scope[item.key]=item.value;
      }
      if (1 === value.type){
        // 数值类型的需要校验起始值
        if (scope.begin>scope.end) {
          openNotificationWithIcon("error", "错误提示", '终止阈值必须小于等于开始阈值');
          return
        }
      }
      let para = {
        productId:ability.productId,
        name: value.name,
        property: value.property,
        standardId: value.standardId,
        rwFlag: value.rwFlag,
        type:value.type,
        scope: JSON.stringify(scope),
      };
      if(!ability.id){
        // 执行添加
        let paras = [];
        paras.push(para);
        _this.handleAdd(paras);
      }else{
        // 执行修改
        para.id = ability.id;
        _this.handleRenew(para);
      }
    }).catch(e => console.log("修改或添加产品属性错误",e));
  };

  /**
   * 添加
   * @param value
   * @returns {boolean}
   */
  handleAdd = async (value) =>{
    let _this = this;
    const {msg, code} = await addProductAbility(value);
    if (code === 0) {
      openNotificationWithIcon("success", "操作结果", "添加成功");
      // 重置表单
      _this.mainFormRef.current.resetFields();
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
    const {msg, code} = await editProductAbility(value);
    if (code === 0) {
      openNotificationWithIcon("success", "操作结果", "修改成功");
      // 重置表单
      _this.mainFormRef.current.resetFields();
      // 刷新列表
      _this.props.refreshList();
      // 关闭窗口
      _this.handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取标准物理量列表
   * @returns {Promise<void>}
   */
  getStandardSelectData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getStandardList();
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      let standardSelectData = [];
      standardSelectData.push((<Option key={-1} value="">请选择</Option>));
      data.forEach(item => {
        standardSelectData.push(<Option key={item.id} value={item.id}>{item.name}</Option>);
      });
      _this.setState({
        standardSelectData
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 数据类型切换事件
   * @param e
   */
  dataTypeChange = e => {
    let _this = this;
    const radio = e.target;
    if(radio && radio.value && 2 === radio.value){
      // 枚举类型
      _this.mainFormRef.current.setFieldsValue({"scope":enumValueTypeSimple});
      _this.setState({
        currentDataType:2,
        enums:enumValueTypeSimple
      });
    }else{
      // 按数值进行处理
      _this.mainFormRef.current.setFieldsValue({"scope":singleValueTypeSimple});
      _this.setState({
        currentDataType:1,
        enums:singleValueTypeSimple
      });
    }
  };

  componentWillMount () {
    const _this = this;
    // 初始化下拉列表数据
    _this.getStandardSelectData();
    _this.props.onRef(_this);
    _this.formItemLayout = {
      labelCol: {span: 4},
      wrapperCol: {span: 18},
    };
  }


  render() {
    const {standardSelectData,ability,enums,currentDataType,visibleModal} = this.state;
    return (
        <Modal title={!ability.id ? '添加属性':'编辑属性'} visible={visibleModal} maskClosable={false} width="60%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
          <Form {...this.formItemLayout} ref={this.mainFormRef}>
            <Card title="数据指标" bordered={false}>
              <Form.Item label='属性名' name="name" initialValue={ability.name || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                         rules={[{required: true, message: '请输入设备名'},{min: 1, message: '长度在 2 到 30 个字符'},{max: 30, message: '长度在 2 到 30 个字符'}]} {...this.formItemLayout}>
                <Input placeholder='例如：温度'/>
              </Form.Item>
              <Form.Item label={<span>属性标识&nbsp;<Tooltip title="描述设备上报时，对应的字段名，同一产品下，属性标识是唯一确定的"><QuestionCircleOutlined /></Tooltip></span>}  name="property" initialValue={ability.property || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                         rules={[{required: true, message: '请输入设备名'},{min: 1, message: '长度在 2 到 30 个字符'},{max: 30, message: '长度在 2 到 30 个字符'}]} {...this.formItemLayout}>
                <Input placeholder='例如：temperature'/>
              </Form.Item>
              <Form.Item label={<span>属性指标&nbsp;<Tooltip title="反应属性标识对应的基本物理量，包括物理单位和符号"><QuestionCircleOutlined /></Tooltip></span>}
                         name="standardId" initialValue={ability.standardId}  rules={[{required: true, message: '请选择产品'}]} {...this.formItemLayout}>
                <Select placeholder="请选择指标" showSearch optionFilterProp="children" allowClear>
                  {standardSelectData}
                </Select>
              </Form.Item>
              <Form.Item label={<span>读写标识&nbsp;<Tooltip title="属性标识字段的控制权限"><QuestionCircleOutlined /></Tooltip></span>}
                         name="rwFlag" initialValue={ability.rwFlag || 1} rules={[{required: true, message: '请选择状态'}]} {...this.formItemLayout}>
                <Radio.Group>
                  <Radio value={1}>只读</Radio>
                  <Radio value={2}>只写</Radio>
                  <Radio value={3}>读写</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label={<span>数据类型&nbsp;<Tooltip title="数值类型的值需要指定数值区间范围，枚举类型的值需要指定各个字典值"><QuestionCircleOutlined /></Tooltip></span>}
                         name="type" initialValue={ability.type || 1} rules={[{required: true, message: '请选择状态'}]} {...this.formItemLayout}>
                <Radio.Group onChange={this.dataTypeChange}>
                  <Radio value={1}>数值</Radio>
                  <Radio value={2}>枚举</Radio>
                </Radio.Group>
              </Form.Item>
            </Card>
            <Card title="数据范围" bordered={false}>
              <Form.List name="scope" initialValue={enums}>
                {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, fieldKey, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                                {...restField}
                                name={[name, 'key']}
                                fieldKey={[fieldKey, 'key']}
                                getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                                rules={[{ required: true, message: '属性key不能为空' }]}
                            >
                              <Input placeholder="key" disabled={!currentDataType || 1 === currentDataType}/>
                            </Form.Item>
                            <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                fieldKey={[fieldKey, 'value']}
                                getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                                rules={[{ required: true, message: '属性value不能为空' }]}
                            >
                              <Input placeholder="value" />
                            </Form.Item>
                            {(!currentDataType || 1 === currentDataType)||(2 === currentDataType && fields.length<=2)?null:<MinusCircleOutlined onClick={() => remove(name)} />}
                          </Space>
                      ))}
                      {
                        (!currentDataType || 1 === currentDataType)?null:
                            <Form.Item>
                              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                                继续添加
                              </Button>
                            </Form.Item>
                      }
                    </>
                )}
              </Form.List>
            </Card>
          </Form>
        </Modal>
    );
  }
}

// 对外暴露
export default EditProductAbility;
