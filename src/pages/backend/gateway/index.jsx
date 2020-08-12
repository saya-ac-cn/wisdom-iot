import React, { Component } from 'react';
import DocumentTitle from 'react-document-title'
import {Col, Form, Button, Table, DatePicker, Select, Icon} from 'antd';
import {getIotGatewayType, getIotGatewayPage} from '../../../api'
import {openNotificationWithIcon} from '../../../utils/window'
import moment from 'moment';
import axios from 'axios'
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
      selectType: ''//用户选择的日志类别
    },
    type: [],// 系统返回的日志类别
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
        dataIndex: 'code', // 显示数据对应的属性名
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
          if (record.authenInfo.enable === 1){
            return '已启用'
          } else if (record.status === 2) {
            return '已禁用'
          } else {
            return '未知'
          }
        }
      },
      {
        title: '创建者',
        dataIndex: 'source', // 显示数据对应的属性名
      }
      ,
      {
        title: '最后心跳',
        dataIndex: 'lastHeartbeat', // 显示数据对应的属性名
      }
    ]
  };

  /**
   * 获取日志数据
   * @returns {Promise<void>}
   */
  getDatas = async () => {
    let _this = this;
    let para = {
      nowPage: _this.state.nowPage,
      pageSize: _this.state.pageSize,
      //type: _this.state.filters.selectType,
      //beginTime: _this.state.filters.beginTime,
      //endTime: _this.state.filters.endTime,
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
    filters.selectType = '';
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

  // 日志选框发生改变
  onChangeType = (value) => {
    let _this = this;
    let {filters} = _this.state;
    filters.selectType = value;
    _this.setState({
      filters,
      nowPage: 1,
    }, function () {
      _this.getDatas()
    });
  };

  /*
   *为第一次render()准备数据
   * 因为要异步加载数据，所以方法改为async执行
   */
  componentWillMount() {
    // 初始化日志类别数据
    //this.getTypeData();
    // 初始化表格属性设置
    this.initColumns();
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
    const {datas, dataTotal, nowPage, pageSize, listLoading,filters, type} = this.state;
    let {beginTime,endTime} = filters;
    let rangeDate;
    if (beginTime !== null && endTime !== null){
      rangeDate = [moment(beginTime),moment(endTime)]
    } else {
      rangeDate = [null,null]
    }
    return (
      <DocumentTitle title='物联网智慧家庭·网关管理'>
        <section>
          <Col span={24} className="toolbar">
            <Form layout="inline">
              <Form.Item>
                <Select value={filters.selectType} className="queur-type" showSearch onChange={this.onChangeType}
                        placeholder="请选择日志类别">
                  {type}
                </Select>
              </Form.Item>
              <Form.Item>
                <RangePicker value={rangeDate} onChange={this.onChangeDate}/>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="button" onClick={this.getDatas}>
                  <Icon type="search" />查询
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="button" onClick={this.reloadPage}>
                  <Icon type="reload" />重置
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
        </section>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default Gateway;
