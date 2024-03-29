import React, {Component} from 'react';
import DocumentTitle from "react-document-title";
import {Button, Col, Input, Table, Form, DatePicker} from "antd";
import {ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {getIotWarringResultPage} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
import './index.less'
import moment from "moment";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：4/18/21 - 4:27 PM
 * 描述：告警规则
 */
const {RangePicker} = DatePicker;

// 定义组件（ES6）
class WaringResult extends Component {

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
            clientId: '',
            topic: '',
            // 查询的日期
            date: null,
            beginTime: null,// 搜索表单的开始时间
            endTime: null,// 搜索表单的结束时间
        },
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

    /*
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        const _this = this;
        _this.columns = [
            {
                title: '告警主题',
                dataIndex: 'topic', // 显示数据对应的属性名
            },
            {
                title: '告警正文',
                dataIndex: 'content'
            },
            {
                title: '关联设备',
                render: (text, record) => {
                    return record.iotClient ? record.iotClient.name : '-';
                }
            },
            {
                title: '关联规则',
                render: (text, record) => {
                    return record.iotRule ? record.iotRule.name : '-';
                }
            },
            {
                title: '告警时间',
                dataIndex: 'createTime', // 显示数据对应的属性名
            },
        ]
    };

    /**
     * 获取告警结果数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let _this = this;
        let para = {
            nowPage: _this.state.nowPage,
            pageSize: _this.state.pageSize,
            name: _this.state.filters.name,
            enable: _this.state.filters.selectStatusType,
            beginTime: _this.state.filters.beginTime,
            endTime: _this.state.filters.endTime,
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getIotWarringResultPage(para);
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
        filters.clientId = '';
        filters.topic = '';
        _this.setState({
            nowPage: 1,
            filters: filters
        }, function () {
            _this.getDatas()
        });
    };


    inputChange = (filed, event) => {
        let _this = this;
        const value = event.target.value;
        let filters = _this.state.filters;
        filters[`${filed}`] = value;
        _this.setState({
            nowPage: 1,
            filters
        })
    };

    // 日期选择发生变化
    onChangeDate = (date, dateString) => {
        let _this = this;
        let {filters} = _this.state;
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== '') {
            filters.beginTime = dateString[0];
            filters.endTime = dateString[1];
        } else {
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
     * 执行异步任务: 发异步ajax请求
     */
    componentDidMount() {
        // 加载页面数据
        this.getDatas();
        // 初始化表格属性设置
        this.initColumns();
    };


    render() {
        // 读取状态数据
        const {datas, dataTotal, nowPage, pageSize, listLoading, filters} = this.state;
        let {beginTime, endTime} = filters;
        let rangeDate;
        if (beginTime !== null && endTime !== null) {
            rangeDate = [moment(beginTime), moment(endTime)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <DocumentTitle title='物联网智慧家庭·告警记录'>
                <section className="waringresult-v1">
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="终端ID">
                                <Input type='number' value={filters.name}
                                       onChange={e => this.inputChange('clientId', e)}
                                       placeholder='按设备id检索'/>
                            </Form.Item>
                            <Form.Item label="告警主题">
                                <Input type='text' value={filters.name} onChange={e => this.inputChange('topic', e)}
                                       placeholder='按告主题检索'/>
                            </Form.Item>
                            <Form.Item label="告警时间">
                                <RangePicker value={rangeDate} onChange={this.onChangeDate}/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={this.getDatas}>
                                    <SearchOutlined/>查询
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={this.reloadPage}>
                                    <ReloadOutlined/>重置
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={24} className="dataTable">
                        <Table size="middle" rowKey="id" loading={listLoading} columns={this.columns} dataSource={datas}
                               pagination={{
                                   current: nowPage,
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
export default WaringResult;