import React, { Component } from 'react';
import {openNotificationWithIcon} from "../../../utils/window";
import {editProduct, addProduct} from "../../../api";
import {Form, Input, Modal} from "antd";
import {clearTrimValueEvent} from "../../../utils/string";

/*
 * 文件名：product.jsx
 * 作者：liunengkai
 * 创建日期：10/20/21 - 9:55 PM
 * 描述：产品编辑
 */

// 定义组件（ES6）
class EditProduct extends Component {

    formRef = React.createRef();

    state = {
        visibleModal: false,
        product:{}
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
        _this.setState({
            product: val,
            visibleModal: true
        },function () {
            //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
            if(!val.id){
                _this.formRef.current.setFieldsValue({"name":''});
            }else{
                _this.formRef.current.setFieldsValue({"name":val.name});
            }
        });
    };


    /**
     * 响应用户提交事件
     */
    handleSubmit = () =>{
        const _this = this;
        const product = _this.state.product;
        _this.formRef.current.validateFields(["name"]).then(value => {
            let para = {
                name: value.name,
            };
            if(!product.id){
                // 执行添加
                _this.handleAdd(para);
            }else{
                // 执行修改
                para.id = product.id;
                _this.handleRenew(para);
            }
        }).catch(e => console.log("修改或添加产品错误",e));
    };

    /**
     * 添加
     * @param value
     * @returns {boolean}
     */
    handleAdd = async (value) =>{
        let _this = this;
        const {msg, code} = await addProduct(value);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "添加成功");
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
     * 修改
     * @param value
     */
    handleRenew = async (value) =>{
        let _this = this;
        const {msg, code} = await editProduct(value);
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

    componentWillMount () {
        const _this = this;
        _this.props.onRef(_this);
        _this.formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        };
    }


    render() {
        const {product,visibleModal} = this.state;
        return (
            <Modal title={!product.id ? '添加产品':'编辑产品'} visible={visibleModal} maskClosable={false} width="40%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
                <Form {...this.formItemLayout} ref={this.formRef}>
                    <Form.Item label='产品名' name="name" initialValue={product.name || ""}  getValueFromEvent={ (e) => clearTrimValueEvent(e)}
                               rules={[{required: true, message: '请输入产品名'},{min: 1, message: '长度在 2 到 20 个字符'},{max: 20, message: '长度在 2 到 20 个字符'}]} {...this.formItemLayout}>
                        <Input placeholder='例如：无线地磁'/>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 对外暴露
export default EditProduct;