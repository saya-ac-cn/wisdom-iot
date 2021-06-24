import React, {Component} from 'react';
import DocumentTitle from "react-document-title";
import {Button, Col, Input, Select, Table, Form, Modal} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {getSymbolEnumString, getWaringRuleStatusString} from "../../../utils/enum";
import {deleteClientIotWarringRule, getIotSymbolUnits, getClientIotWarringRulePage} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
import './index.less'
import EditRule from './edit'
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：4/18/21 - 4:27 PM
 * 描述：告警规则
 */
const {Option} = Select;

// 定义组件（ES6）
class ClientRule extends Component {

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
            clientId: '',// 设备id
            ruleId:'',//告警规则id
            selectStatusType: ''//用户选择的状态类别
        },
        symbolUnitsOption: [],// 选择框（基本物理量）
        symbolUnits: null
    };

    /*
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        const _this = this;
        _this.columns = [
            {
                title: '设备名',
                render: (text,record) => {
                    return record.client.name || null;
                }
            },
            {
                title: '告警名',
                render: (text,record) => {
                    return record.rule.name
                }
            },
            {
                title: '物理量',
                render: (text,record) => {
                    return _this.transformSymbolUnits(record.rule.units)
                }
            },
            {
                title: '规则',
                render: (text,record) => {
                    if (!record.symbol && 'RANGE' === record.rule.symbol){
                        return <span>大于等于<b>{record.rule.value1}</b>,小于等于<b>{record.rule.value2}</b></span>
                    } else {
                        return <span>{getSymbolEnumString(record.rule.symbol)}<b>{record.rule.value1}</b></span>
                    }
                }
            },
            {
                title: '启用状态',
                render: (text,record) => {
                    return getWaringRuleStatusString(record.rule.enable);
                }
            },
            {
                title: '操作',
                render: (text, record) => (
                    <div>
                        <Button type="primary" title="删除" onClick={() => this.handleDellRule(record)}
                                shape="circle" icon={<DeleteOutlined/>}/>
                    </div>
                ),
            },
        ]
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
     * 规则启用状态
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
            _this.setState({
                symbolUnits
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    transformSymbolUnits = (symbol) => {
        let _this = this;
        if (!_this.state.symbolUnits || !symbol) {
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
            clientId: _this.state.filters.clientId,
            ruleId: _this.state.filters.ruleId,
            enable: _this.state.filters.selectStatusType
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getClientIotWarringRulePage(para);
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
        filters.ruleId = '';
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
     */
    inputChange = (filed,event) => {
        let _this = this;
        const value = event.target.value;
        let filters = _this.state.filters;
        filters[`${filed}`] = value;
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
    refreshListFromEditRule = () => {
        this.getDatas();
    };

    handleDellRule = (value) => {
        let _this = this;
        Modal.confirm({
            title: '确认解除告警规则绑定？',
            content: `确认解除告警规则吗?一旦解除，该设备上报的数据将不再产生告警`,
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deleteClientIotWarringRule([{id:value.id, clientId:value.clientId, ruleId:value.ruleId}]);
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "解除绑定成功");
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
        // 绑定刷新（供子页面调用）
        this.refreshListFromEditRule = this.refreshListFromEditRule.bind(this);
        // 加载物理量
        this.getIotSymbolUnits();
        // 加载页面数据
        this.getDatas();
        // 初始化表格属性设置
        this.initColumns();
        // 初始化设备状态数
        this.initStatusSelect()
    };


    render() {
        // 读取状态数据
        const {datas, dataTotal, nowPage, pageSize, listLoading, filters, statusType} = this.state;
        return (
            <DocumentTitle title='物联网智慧家庭·绑定规则'>
                <section className="clientrule-v1">
                    <EditRule onRef={this.bindEditRuleRef.bind(this)} refreshList={this.refreshListFromEditRule}/>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="终端ID">
                                <Input type='number' value={filters.name} onChange={e => this.inputChange('clientId',e)}
                                       placeholder='按设备id检索'/>
                            </Form.Item>
                            <Form.Item label="规则ID">
                                <Input type='number' value={filters.name} onChange={e => this.inputChange('ruleId',e)}
                                       placeholder='按告告警规则id检索'/>
                            </Form.Item>
                            <Form.Item label="启用状态">
                                <Select value={filters.selectStatusType} className="queur-type" showSearch
                                        onChange={this.onChangeStatusType}
                                        placeholder="请选择启用状态">
                                    {statusType}
                                </Select>
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
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={e => this.openEditModal({id: -1})}>
                                    <PlusOutlined/>添加
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
export default ClientRule;