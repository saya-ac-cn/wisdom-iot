import React, { Component } from 'react';
import DocumentTitle from "react-document-title";
import {Button, Col, DatePicker, Form, Input, Modal, Select, Table} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";
import moment from "moment";
import './index.less'
import {getIotAppointmentPage, deleteIotAppointment} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
import {getAppointmentExcuteStatusString} from "../../../utils/enum";
import EditAppointment from "./edit";
/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/8/29 - 10:32 下午
 * 描述：
 */
const {RangePicker} = DatePicker;
const {Option} = Select;
// 定义组件（ES6）
class Appointment extends Component {

  editRef = React.createRef();

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
      name: '',// 预约名
      selectStatusType: ''//用户选择的状态类别
    },
    statusType: [],// 指令下发状态类别
  };

  /*
  * 初始化Table所有列的数组
  */
  initColumns = () => {
    this.columns = [
      {
        title: '调度名',
        dataIndex: 'name', // 显示数据对应的属性名
      },
      {
        title: '网关名',
        render: (text,record) => {
          return record.iotClient.gateway.name || null;
        }
      },
      {
        title: '设备名',
        render: (text,record) => {
          return record.iotClient.name || null;
        }
      },
      {
        title: '设备地址',
        render: (text,record) => {
          return record.iotClient.gateway.address || null;
        }
      },
      {
        title: '指令名',
        render: (text, record) => {
          return !record.iotAbility?'-':record.iotAbility.name
        }
      },
      {
        title: '指令值',
        render: (text, record) => {
          return this.formatScope(record);
        }
      },
      {
        title: '执行规则',
        dataIndex: 'cron', // 显示数据对应的属性名
      },
      {
        title: '最后执行时间',
        dataIndex: 'excuteTime', // 显示数据对应的属性名
      },
      {
        title: '执行状态',
        render: (text,record) => {
          return getAppointmentExcuteStatusString(record.status)
        }
      },
      {
        title: '最后心跳',
        render: (text,record) => {
          return record.iotClient.lastLinkTime || null;
        }
      },
      {
        title: '操作',
        render: (text, record) => (
          <div>
            <Button type="primary" title="编辑" onClick={() => this.handleModalEdit(record)} shape="circle" icon={<EditOutlined/>}/>
            &nbsp;
            <Button type="primary" title="删除" onClick={() => this.handleDellAppointment(record)} shape="circle" icon={<DeleteOutlined />}/>
          </div>
        ),
      },
    ]
  };

  /**
   * 格式化数值范围
   * @param record
   * @returns {string}
   */
  formatScope = (record) => {
    const ability = record.iotAbility;
    if (!ability){
      return record.command;
    }
    if ((ability.type)&&(1===ability.type)) {
      return record.command;
    }else{
      // 枚举类型
      if (ability.scope){
        let scope = JSON.parse(ability.scope);
        return scope[record.command];
      }
      return record.command;
    }
  };

  // 回调函数,改变页宽大小
  changePageSize = (pageSize, current) => {
    let _this = this;
    // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
    _this.setState({
      pageSize: pageSize,
      nowPage: 1,
    }, function () {
      _this.getDatas();
    });
  };

  // 回调函数，页面发生跳转
  changePage = (current) => {
    let _this = this;
    _this.setState({
      nowPage: current,
    }, function () {
      _this.getDatas();
    });
  };

  /**
   * 预约下发状态
   */
  initStatusSelect = () => {
    let _this = this;
    let statusType = [
      (<Option key={-1} value="">请选择</Option>),
      (<Option key={1} value="1">已创建</Option>),
      (<Option key={2} value="2">已下发</Option>),
    ];
    _this.setState({
      statusType
    });
  };

  /**
   * 获取网关数据
   * @returns {Promise<void>}
   */
  getDatas = async () => {
    let _this = this;
    let para = {
      nowPage: _this.state.nowPage,
      pageSize: _this.state.pageSize,
      name: _this.state.filters.name,
      status: _this.state.filters.selectStatusType,
      beginTime: _this.state.filters.beginTime,
      endTime: _this.state.filters.endTime,
    };
    // 在发请求前, 显示loading
    _this.setState({listLoading: true});
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotAppointmentPage(para);
    // 在请求完成后, 隐藏loading
    _this.setState({listLoading: false});
    if (code === 0) {
      _this.setState({
        // 总数据量
        dataTotal: data.dateSum,
        // 表格数据
        datas: data.grid
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  reloadPage = () => {
    // 重置查询条件
    let _this = this;
    let filters = _this.state.filters;
    filters.beginTime = null;
    filters.endTime = null;
    filters.name = '';
    filters.selectStatusType = '';
    _this.setState({
      nowPage: 1,
      filters: filters
    }, function () {
      _this.getDatas()
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

  /**
   * 显示添加的弹窗
   */
  handleModalAdd = () => {
    this.editRef.handleDisplay({});
  };

  /**
   * 显示修改的弹窗
   * @param value
   * @returns {Promise<void>}
   */
  handleModalEdit = async (value) => {
    let _this = this;
    _this.editRef.handleDisplay(value);
  };

  /**
   * 添加或者修改组件ref绑定
   * @param ref
   */
  bindAppointmentFormRef = (ref) => {
    this.editRef = ref
  };

  /**
   * 绑定刷新事件
   */
  refreshListFromAppointmentModal = () =>{
    this.getDatas();
  };

  /**
   * 删除预约
   * @param value
   */
  handleDellAppointment = (value) => {
    let _this = this;
    Modal.confirm({
      title: '删除确认',
      content: `确认删除名字为:"${value.name}"的调度计划吗?一旦删除，该调度指令将不会下发到设备`,
      onOk: async () => {
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        const {msg, code} = await deleteIotAppointment(value.code);
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
          openNotificationWithIcon("success", "操作结果", "删除成功");
          _this.getDatas();
        } else {
          openNotificationWithIcon("error", "错误提示", msg);
        }
      }
    })
  };

  /**
   * 执行异步任务: 发异步ajax请求
   */
  componentDidMount() {
    // 初始化表格属性设置
    this.initColumns();
    // 初始化设备状态数
    this.initStatusSelect()
    this.refreshListFromAppointmentModal = this.refreshListFromAppointmentModal.bind(this);
    // 加载页面数据
    this.getDatas();
  };

  render() {
    // 读取状态数据
    const {datas, dataTotal, nowPage, pageSize, listLoading,filters,statusType, modalStatus} = this.state;
    let {beginTime,endTime} = filters;
    let rangeDate;
    if (beginTime !== null && endTime !== null){
      rangeDate = [moment(beginTime),moment(endTime)]
    } else {
      rangeDate = [null,null]
    }
    return (
      <DocumentTitle title='物联网智慧家庭·调度计划'>
        <section className="appointment-v1">
          <Col span={24} className="toolbar">
            <Form layout="inline">
              <Form.Item label="计划名">
                <Input type='text' value={filters.name} onChange={this.nameInputChange}
                       placeholder='按计划名检索'/>
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
          <Col span={24} className="dataTable">
            <Table size="middle" rowKey="code" loading={listLoading} columns={this.columns} dataSource={datas}
                   pagination={{
                     current:nowPage,
                     showTotal: () => `当前第${nowPage}页 共${dataTotal}条`,
                     pageSize: pageSize, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                     onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
                     onChange: this.changePage,
                   }}/>
          </Col>
          <EditAppointment onRef={this.bindAppointmentFormRef.bind(this)} refreshList={this.refreshListFromAppointmentModal}/>
        </section>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default Appointment;
