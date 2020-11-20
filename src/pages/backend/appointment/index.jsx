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
import {
  getIotAppointmentPage,
  addIotAppointment,
  editIotAppointment,
  deleteIotAppointment
} from "../../../api";
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
      name: '',// 预约名
      selectStatusType: ''//用户选择的状态类别
    },
    statusType: [],// 指令下发状态类别
    modalStatus: 0, // 标识添加/更新的确认框是否显示, 0: 都不显示, 1: 显示添加, 2: 显示更新, 3: 显示详情
  };

  /*
  * 初始化Table所有列的数组
  */
  initColumns = () => {
    this.columns = [
      {
        title: '预约名',
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
        title: '地址',
        render: (text,record) => {
          return record.iotClient.gateway.address || null;
        }
      },
      {
        title: '执行指令',
        dataIndex: 'command', // 显示数据对应的属性名
      },
      {
        title: '执行时间',
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

  /*
  * 显示添加的弹窗
  */
  handleModalAdd = () => {
    this.setState({
      modalStatus: 1
    })
  };

  /*
  * 显示修改的弹窗
  */
  handleModalEdit = (value) => {
    this.lineDate = value;
    // 查看执行时间，历史数据不能更改
    let excuteTime = moment(value.excuteTime,'YYYY-MM-DD HH:mm:ss')
    let now = moment()
    if (excuteTime.diff(now) <0 && value.status !== 1){
      openNotificationWithIcon("error", "错误提示", '您要修改的预约指令已经执行，不能再次修改。');
      return
    }
    this.setState({
      modalStatus: 2
    })
  };

  /*
  * 响应点击取消: 隐藏弹窗
  */
  handleModalCancel = (type) => {
    if (type){
      // 清除输入数据
      this.formRef.current.formRef.current.resetFields();
    }
    // 隐藏确认框
    this.setState({
      modalStatus: 0
    })
  };

  /**
   * 提交表单，添加预约
   */
  handleAddAppointment = (e) => {
    e.preventDefault();
    let _this = this;
    _this.formRef.current.formRef.current.validateFields(["clientId","name","command","excuteTime"])
      .then(async (values) => {
        let para = {
          clientId: values.clientId,
          name: values.name,
          command: values.command,
          excuteTime: (values.excuteTime).format('YYYY-MM-DD HH:mm:ss')
        }
        _this.setState({listLoading: true});
        const {msg, code} = await addIotAppointment(para)
        _this.setState({listLoading: false});
        if (code === 0) {
          openNotificationWithIcon("success", "操作结果", "添加成功");
          // 重置表单
          _this.formRef.current.formRef.current.resetFields();
          // 关闭弹窗
          _this.handleModalCancel(true)
          // 重新加载数据
          _this.getDatas();
        } else {
          openNotificationWithIcon("error", "错误提示", msg);
        }
      }).catch(errorInfo => {
      console.log(errorInfo)
    });
  }

  /**
   * 提交表单，修改预约
   */
  handleEditAppointment = (e) => {
    e.preventDefault();
    let _this = this;
    _this.formRef.current.formRef.current.validateFields(["clientId","name","command","excuteTime"])
      .then(async (values) => {
        let para = {
          id: this.lineDate.id,
          clientId: values.clientId,
          name: values.name,
          command: values.command,
          excuteTime: (values.excuteTime).format('YYYY-MM-DD HH:mm:ss')
        }
        _this.setState({listLoading: true});
        const {msg, code} = await editIotAppointment(para)
        _this.setState({listLoading: false});
        if (code === 0) {
          openNotificationWithIcon("success", "操作结果", "添加成功");
          // 重置表单
          _this.formRef.current.formRef.current.resetFields();
          // 关闭弹窗
          _this.handleModalCancel(true)
          // 重新加载数据
          _this.getDatas();
        } else {
          openNotificationWithIcon("error", "错误提示", msg);
        }
      }).catch(errorInfo => {
      console.log(errorInfo)
    });
  }

  /*
  * 删除预约
  */
  handleDellAppointment = (value) => {
    // 查看执行时间，历史数据不能删除
    let excuteTime = moment(value.excuteTime,'YYYY-MM-DD HH:mm:ss')
    let now = moment()
    if (excuteTime.diff(now) <0 && value.status !== 1){
      openNotificationWithIcon("error", "错误提示", '您要删除的预约指令已经执行，不能允许删除历史数据。');
      return
    }
    let _this = this;
    Modal.confirm({
      title: '删除确认',
      content: `确认删除名字为:"${value.name}"的预约吗?一旦删除，该预约将不会下发到设备`,
      onOk: async () => {
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        let para = { id: value.id };
        const {msg, code} = await deleteIotAppointment(para);
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
  }

  /*
   *为第一次render()准备数据
   * 因为要异步加载数据，所以方法改为async执行
   */
  componentWillMount() {
    // 初始化表格属性设置
    this.initColumns();
    // 初始化设备状态数
    this.initStatusSelect()
  };

  /*
  执行异步任务: 发异步ajax请求
   */
  componentDidMount() {
    // 加载页面数据
    this.getDatas();
  };

  render() {
    // 读取状态数据
    const {datas, dataTotal, nowPage, pageSize, listLoading,filters,statusType, modalStatus} = this.state;
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
          <Col span={24} className="dataTable">
            <Table size="middle" rowKey="id" loading={listLoading} columns={this.columns} dataSource={datas}
                   pagination={{
                     current:nowPage,
                     showTotal: () => `当前第${nowPage}页 共${dataTotal}条`,
                     pageSize: pageSize, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                     onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
                     onChange: this.changePage,
                   }}/>
          </Col>
          <Modal
            title="添加预约"
            width="50%"
            visible={modalStatus === 1}
            closable={true}
            maskClosable={false}
            onOk={this.handleAddAppointment}
            onCancel={()=>this.handleModalCancel(false)}>
            <EditAppointment ref={this.formRef} appointment={this.lineDate || {}}/>
          </Modal>
          <Modal
            title="修改预约"
            width="50%"
            visible={modalStatus === 2}
            closable={true}
            maskClosable={false}
            onOk={this.handleEditAppointment}
            onCancel={()=>this.handleModalCancel(false)}>
            <EditAppointment ref={this.formRef} appointment={this.lineDate || {}}/>
          </Modal>
        </section>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default Appointment;
