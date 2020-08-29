import React, { Component } from 'react';
import DocumentTitle from "react-document-title";
import {Button, Col, DatePicker, Form, Input, Modal, Select, Table} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import moment from "moment";

/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/8/29 - 10:32 下午
 * 描述：
 */

// 定义组件（ES6）
class Appointment extends Component {

  formRef = React.createRef();

  state = {
    // 返回的单元格数据
    datas: [],
    // 总数据行数
    dataTotal: 0,
    // 当前页
    nowPage: 1,
    // 页面宽度
    pageSize: 10,
    // 是否显示加载
    listLoading: false,
    filters: {
      // 查询的日期
      date: null,
      beginTime: null,// 搜索表单的开始时间
      endTime: null,// 搜索表单的结束时间
      name: '',// 规则名
      clientId: null,// 终端id
      selectStatusType: ''//用户选择的状态类别
    },
    statusType: [],// 设备状态类别
    modalStatus: 0, // 标识添加/更新的确认框是否显示, 0: 都不显示, 1: 显示添加, 2: 显示更新, 3: 显示详情
  };

  constructor(props){
    super(props)
  }

  /**
   * 初始化设备状态下拉选择
   */
  initStatusSelect = () => {
    let _this = this;
    let statusType = [
      (<Option key={-1} value={-1}>请选择</Option>),
      (<Option key={1} value={1}>已创建</Option>),
      (<Option key={2} value={2}>已下发</Option>),
    ];
    _this.setState({
      statusType
    });
  };

  /**
   * 日期选择发生变化
   * @param date
   * @param dateString
   */
  onChangeDate = (date, dateString) => {
    let _this = this;
    let {filters} = _this.state;
    // 为空要单独判断
    if (dateString[0] !== '' && dateString[1] !== ''){
      filters.beginTime = dateString[0];
      filters.endTime = dateString[1];
    }else{
      filters.beginTime = null;
      filters.endTime = null;
    }
    _this.setState({
      filters,
      nowPage: 1,
    }, function () {
      _this.getDatas()
    });
  };

  /**
   * 预约执行状态选框发生改变
   * @param value
   */
  onChangeStatusType = (value) => {
    let _this = this;
    let {filters} = _this.state;
    filters.selectStatusType = value;
    _this.setState({
      filters,
      nowPage: 1,
    }, function () {
      _this.getDatas()
    });
  };


  /**
   * 双向绑定用户查询预约名
   * @param event
   */
  nameInputChange = (event) => {
    let _this = this;
    const value = event.target.value;
    let filters = _this.state.filters;
    filters.name = value;
    _this.setState({
      nowPage: 1,
      filters
    })
  };

  /*
   *为第一次render()准备数据
   * 因为要异步加载数据，所以方法改为async执行
   */
  componentWillMount() {
    // 初始化表格属性设置
    //this.initColumns();
    // 初始化设备状态数
    //this.initStatusSelect()
  };

  /*
  执行异步任务: 发异步ajax请求
   */
  componentDidMount() {
    // 加载页面数据
    //this.getDatas();
  };

  render() {
    // 读取状态数据
    const {datas, dataTotal, nowPage, pageSize, listLoading,filters,statusType, modalStatus, lineDateGateway} = this.state;
    // 读取所选中的行数据
    const lineDate = this.lineDate || {}; // 如果还没有指定一个空对象
    let {beginTime,endTime} = filters;
    let rangeDate;
    if (beginTime !== null && endTime !== null){
      rangeDate = [moment(beginTime),moment(endTime)]
    } else {
      rangeDate = [null,null]
    }
    return (
      <DocumentTitle title='物联网智慧家庭·预约管理'>
        <section className="appointment-v1">
          <Col span={24} className="toolbar">
            <Form layout="inline">
              <Form.Item label="预约名">
                <Input type='text' value={filters.name} onChange={this.nameInputChange}
                       placeholder='按预约名检索'/>
              </Form.Item>
              <Form.Item label="设备状态">
                <Select value={filters.selectStatusType} className="queur-type" showSearch onChange={this.onChangeStatusType}
                        placeholder="请选择设备状态">
                  {statusType}
                </Select>
              </Form.Item>
              <Form.Item label="执行时间">
                <RangePicker value={rangeDate} onChange={this.onChangeDate}/>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="button" onClick={this.getDatas}>
                  <SearchOutlined />查询
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="button" onClick={this.reloadPage}>
                  <ReloadOutlined />重置
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="button" onClick={this.handleModalAdd}>
                  <PlusOutlined />添加
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </section>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default Appointment;
