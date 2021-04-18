import React, { Component } from 'react';
import DocumentTitle from "react-document-title";
import {Button, Col, DatePicker, Input, Select, Table,Form} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {getSymbolEnumString,getWaringRuleStatusString} from "../../../utils/enum";
import {getIotSymbolUnits, getIotWarringRulePage} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
import './index.less'
import EditRule from  './edit'
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：4/18/21 - 4:27 PM
 * 描述：告警规则
 */
const {Option} = Select;

// 定义组件（ES6）
class WaringRule extends Component {

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
            name: '',// 告警规则名
            selectStatusType: ''//用户选择的状态类别
        },
        symbolUnitsOption: [],// 选择框（基本物理量）
        symbolUnits:null
    };

    /*
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        const _this = this;
        _this.columns = [
            {
                title: '告警名',
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
                title: '物理量',
                render: (text,record) => {
                    return _this.transformSymbolUnits(record.units)
                }
            },
            {
                title: '规则',
                render: (text,record) => {
                    if (!record.symbol && 'RANGE' === record.symbol){
                        return <span>大于等于<b>{record.value1}</b>,小于等于<b>{record.value2}</b></span>
                    } else {
                        return <span>{getSymbolEnumString(record.symbol)}<b>{record.value1}</b></span>
                    }
                }
            },
            {
                title: '启用状态',
                render: (text,record) => {
                    return getWaringRuleStatusString(record.enable);
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
     * 打开编辑弹窗
     * @param value
     */
    openEditModal = (value) => {
        const _this = this;
        // 触发子组件的调用
        _this.editRef.handleDisplay(value);
    };

    /**
     * 预约下发状态
     */
    initStatusSelect = () => {
        let _this = this;
        let statusType = [
            (<Option key={-1} value="">请选择</Option>),
            (<Option key={1} value="1">启用</Option>),
            (<Option key={2} value="2">禁用</Option>),
        ];
        _this.setState({
            statusType
        });
    };

    /**
     * 获取物理量
     * @returns {Promise<void>}
     */
    getIotSymbolUnits = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getIotSymbolUnits();
        if (code === 0) {
            const symbolUnits = data;
            // 利用更新状态的回调函数，渲染下拉选框
            let symbolUnitsOption = [];
            symbolUnitsOption.push((<Option key={-1} value="">请选择</Option>));
            for(let key  in symbolUnits){
                let item = symbolUnits[key];
                symbolUnitsOption.push((<Option key={item.symbol} value={item.symbol}>{item.name}</Option>));
            }
            _this.setState({
                symbolUnitsOption,symbolUnits
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    transformSymbolUnits = (symbol) => {
        let _this = this;
        if (!_this.state.symbolUnits || !symbol){
            return '-'
        } else {
            return _this.state.symbolUnits[symbol];
        }
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
            enable: _this.state.filters.selectStatusType,
            beginTime: _this.state.filters.beginTime,
            endTime: _this.state.filters.endTime,
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getIotWarringRulePage(para);
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
     * 打开编辑弹窗
     * @param value
     */
    openEditModal = (value) => {
        const _this = this;
        // 触发子组件的调用
        _this.editRef.handleDisplay(value);
    };

    bindEditRuleRef = (ref) => {
        this.editRef = ref
    };

    /**
     * 修改页面调用父页面的专属刷新方法
     */
    refreshListFromEditRule = () =>{
        this.getDatas();
    };

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
        // 绑定刷新（供子页面调用）
        this.refreshListFromEditRule  = this.refreshListFromEditRule.bind(this);
        // 加载物理量
        this.getIotSymbolUnits();
        // 加载页面数据
        this.getDatas();
    };


  render() {
      // 读取状态数据
      const {datas, dataTotal, nowPage, pageSize, listLoading,filters,statusType} = this.state;
    return (
        <DocumentTitle title='物联网智慧家庭·告警管理'>
            <section className="waringrule-v1">
                <EditRule onRef={this.bindEditRuleRef.bind(this)} refreshList={this.refreshListFromEditRule}/>
                <Col span={24} className="toolbar">
                    <Form layout="inline">
                        <Form.Item label="告警名">
                            <Input type='text' value={filters.name} onChange={this.nameInputChange}
                                   placeholder='按告警名检索'/>
                        </Form.Item>
                        <Form.Item label="启用状态">
                            <Select value={filters.selectStatusType} className="queur-type" showSearch onChange={this.onChangeStatusType}
                                    placeholder="请选择启用状态">
                                {statusType}
                            </Select>
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
                            <Button type="primary" htmlType="button" onClick={e => this.openEditModal({id:-1})}>
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
            </section>
        </DocumentTitle>
    );
  }
}

// 对外暴露
export default WaringRule;