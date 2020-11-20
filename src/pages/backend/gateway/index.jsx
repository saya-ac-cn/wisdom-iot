import React, { Component } from 'react';
import DocumentTitle from 'react-document-title'
import {SearchOutlined, ReloadOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {Row, Col, Form, Button, Table, DatePicker, Input, Select, Modal} from 'antd';
import {getIotGatewayType, getIotGatewayPage, addIotGateway, deleteIotGateway} from '../../../api'
import {openNotificationWithIcon} from '../../../utils/window'
import {getGatewayEnableString} from '../../../utils/enum'
import moment from 'moment';
import "./index.less"
import AddGateWay from "./insert"
import EditGateWay from "./edit"
/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/8/9 - 10:07 下午
 * 描述：
 */
const {RangePicker} = DatePicker;
const {Option} = Select;
// 定义组件（ES6）
class Gateway extends Component {

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
      code: '',// 网关编码
      selectGatewayType: '',//用户选择的日志类别
      selectStatusType: ''//用户选择的状态类别
    },
    gatewayType: [],// 系统返回的设备类别
    statusType: [],// 设备状态类别
    modalStatus: 0, // 标识添加/更新的确认框是否显示, 0: 都不显示, 1: 显示添加, 2: 显示更新, 3: 显示详情
  };

  /*
  * 初始化Table所有列的数组
  */
  initColumns = () => {
    this.columns = [
      {
        title: '网关名',
        dataIndex: 'name', // 显示数据对应的属性名
      },
      {
        title: '网关编码',
        dataIndex: 'uuid', // 显示数据对应的属性名
      },
      {
        title: '认证编码',
        render: (text,record) => {
            return record.authenInfo.username || null;
        }
      },
      {
        title: '网关类型',
        dataIndex: 'deviceTypeInfo', // 显示数据对应的属性名
      },
      {
        title: '地址',
        dataIndex: 'address', // 显示数据对应的属性名
      },
      {
        title: '是否启用',
        render: (text,record) => {
          return getGatewayEnableString(record.authenInfo.enable)
        }
      },
      {
        title: '创建者',
        dataIndex: 'source', // 显示数据对应的属性名
      },
      {
        title: '最后心跳',
        dataIndex: 'lastHeartbeat', // 显示数据对应的属性名
      },
      {
        title: '操作',
        render: (text, record) => (
          <div>
            <Button type="primary" title="查看" onClick={() => this.handleModalInfo(record)} shape="circle" icon={<EyeOutlined/>}/>
            &nbsp;
            <Button type="primary" title="编辑" onClick={() => this.handleModalEdit(record)} shape="circle" icon={<EditOutlined/>}/>
            &nbsp;
            <Button type="primary" title="删除" onClick={() => this.handleDellGateway(record)} shape="circle" icon={<DeleteOutlined />}/>
          </div>
        ),
      },
    ]
  };

  /**
   * 获取网关类别
   * @returns {Promise<void>}
   */
  getTypeData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotGatewayType();
    if (code === 0) {
      // 利用更新状态的回调函数，渲染下拉选框
      let gatewayType = [];
      gatewayType.push((<Option key={-1} value="">请选择</Option>));
      data.forEach(item => {
        gatewayType.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
      });
      _this.setState({
        gatewayType
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 初始化设备状态下拉选择
   */
  initStatusSelect = () => {
    let _this = this;
    let statusType = [
      (<Option key={-1} value="">请选择</Option>),
      (<Option key={1} value="1">已启用</Option>),
      (<Option key={2} value="2">已禁用</Option>),
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
      code: _this.state.filters.code,
      deviceType: _this.state.filters.selectGatewayType,
      enable: _this.state.filters.selectStatusType,
      beginTime: _this.state.filters.beginTime,
      endTime: _this.state.filters.endTime,
    };
    // 在发请求前, 显示loading
    _this.setState({listLoading: true});
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIotGatewayPage(para);
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
    filters.code = '';
    filters.selectGatewayType = '';
    filters.selectStatusType = '';
    _this.setState({
      nowPage: 1,
      filters: filters
    }, function () {
      _this.getDatas()
    });
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

  // 日期选择发生变化
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
   * 网关类别选框发生改变
   * @param value
   */
  onChangeGatewayType = (value) => {
    let _this = this;
    let {filters} = _this.state;
    filters.selectGatewayType = value;
    _this.setState({
      filters,
      nowPage: 1,
    }, function () {
      _this.getDatas()
    });
  };

  /**
   * 网关状态选框发生改变
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
   * 双向绑定用户查询网关编码
   * @param event
   */
  codeInputChange = (event) => {
    let _this = this;
    const value = event.target.value;
    let filters = _this.state.filters;
    filters.code = value;
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
    this.lineDate = {
      "id": value.id,
      "gatewayEnable":value.authenInfo.enable,
      "authenUserName":value.authenInfo.username,
      "gatewayName":value.name,
      "gatewayAddress":value.address,
      "gatewayType":value.deviceType
    };
    this.setState({
      modalStatus: 2
    })
  };

  /*
  * 显示详情的弹窗
  */
  handleModalInfo = (value) => {
    this.lineDate = value
    this.setState({
      modalStatus: 3
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
   * 提交表单，添加网关设备
   */
  handleAddGateWay = (e) => {
    e.preventDefault();
    let _this = this;
    _this.formRef.current.formRef.current.validateFields(["authenPassword","authenUserName","gatewayName","gatewayAddress","gatewayType"])
      .then(async (values) => {
        let para = {
          name: values.gatewayName,
          address: values.gatewayAddress,
          deviceType: values.gatewayType,
          authenInfo: {username:values.authenUserName,password:values.authenPassword}
        }
        const {msg, code} = await addIotGateway(para)
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
  * 删除指定网关
  */
  handleDellGateway = (value) => {
    let _this = this;
    Modal.confirm({
      title: '删除确认',
      content: `确认删除名字为:"${value.name}"的网关吗?一旦删除，该网关下面的所有设备将无法使用`,
      onOk: async () => {
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        let para = { id: value.id };
        const {msg, code} = await deleteIotGateway(para);
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

  /*
   *为第一次render()准备数据
   * 因为要异步加载数据，所以方法改为async执行
   */
  componentWillMount() {
    // 初始化网关类别数据
    this.getTypeData();
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
    const {datas, dataTotal, nowPage, pageSize, listLoading,filters, gatewayType,statusType, modalStatus} = this.state;
    // 读取所选中的行数据
    const gateWay = this.lineDate || {}; // 如果还没有指定一个空对象
    let {beginTime,endTime} = filters;
    let rangeDate;
    if (beginTime !== null && endTime !== null){
      rangeDate = [moment(beginTime),moment(endTime)]
    } else {
      rangeDate = [null,null]
    }
    return (
      <DocumentTitle title='物联网智慧家庭·网关管理'>
        <section className="gateWay-v1">
          <Col span={24} className="toolbar">
            <Form layout="inline">
              <Form.Item label="网关编码">
                <Input type='text' value={filters.code} onChange={this.codeInputChange}
                       placeholder='按网关编码检索'/>
                </Form.Item>
              <Form.Item label="网关类型">
                <Select value={filters.selectGatewayType} className="queur-type" showSearch onChange={this.onChangeGatewayType}
                        placeholder="请选择网关类型">
                  {gatewayType}
                </Select>
              </Form.Item>
              <Form.Item label="网关状态">
                <Select value={filters.selectStatusType} className="queur-type" showSearch onChange={this.onChangeStatusType}
                        placeholder="请选择网关状态">
                  {statusType}
                </Select>
              </Form.Item>
              <Form.Item label="最后心跳">
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
            title="添加网关"
            width="50%"
            visible={modalStatus === 1}
            onOk={this.handleAddGateWay}
            maskClosable={false}
            onCancel={()=>this.handleModalCancel(true)}>
            <AddGateWay ref={this.formRef} gateWay={{}}/>
          </Modal>
          <Modal
            title="修改网关"
            width="50%"
            visible={modalStatus === 2}
            closable={true}
            footer={null}
            maskClosable={false}
            onCancel={()=>this.handleModalCancel(false)}>
            <EditGateWay ref={this.formRef} gateWay={gateWay}/>
          </Modal>
          <Modal
            title="网关详情"
            className="gateWay-v1-modal-info"
            width="50%"
            visible={modalStatus === 3}
            closable={true}
            footer={null}
            maskClosable={false}
            onCancel={()=>this.handleModalCancel(false)}>
              <table>
                <caption>{gateWay.name || "-"}</caption>
                <colgroup>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                  <col width="10%"/>
                </colgroup>
                <tbody>
                  <tr>
                    <td className="label">网关ID</td>
                    <td className="value">{gateWay.id || "-"}</td>
                    <td className="label">网关编码</td>
                    <td colSpan="3" className="value">{gateWay.uuid || "-"}</td>
                    <td className="label">认证名称</td>
                    <td colSpan="3" className="value">{!gateWay.authenInfo?"-":gateWay.authenInfo.username}</td>
                  </tr>
                  <tr>
                    <td className="label">网关类型</td>
                    <td className="value">{gateWay.deviceTypeInfo || "-"}</td>
                    <td className="label">接入状态</td>
                    <td className="value">{!gateWay.authenInfo?"-":getGatewayEnableString(gateWay.authenInfo.enable)}</td>
                    <td className="label">创建者</td>
                    <td className="value">{gateWay.source || "-"}</td>
                    <td className="label">网关地址</td>
                    <td className="value" colSpan="3" >{gateWay.address || "-"}</td>
                  </tr>
                  <tr>
                    <td className="label" colSpan="2">最后一次心跳时间</td>
                    <td className="value" colSpan="2">{gateWay.lastHeattbeat || "-"}</td>
                    <td className="label">创建时间</td>
                    <td className="value" colSpan="2">{gateWay.createTime || "-"}</td>
                    <td className="label">修改时间</td>
                    <td className="value" colSpan="2">{gateWay.updateTime || "-"}</td>
                  </tr>
                </tbody>
              </table>
              <div className="print-time">若数据显示异常，请重新打开&nbsp;&nbsp;&nbsp;&nbsp;平台打印时间：{moment().format("YYYY-MM-DD HH:mm:ss") }</div>
          </Modal>
        </section>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default Gateway;
