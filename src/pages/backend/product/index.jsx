import React, { Component } from 'react';
import {Button, Col, Row, Table, Modal, Menu,Tooltip,Tabs} from 'antd';
import './index.less'
import DocumentTitle from 'react-document-title'
import {
    EllipsisOutlined,
    MenuOutlined,
    EditOutlined,
    PlusOutlined,
    LineOutlined,WarningOutlined,
    DeleteOutlined,CodeOutlined,ControlOutlined
} from '@ant-design/icons';
import {
    getProductList,
    getProductAbilityList,
    deleteProduct,
    deleteProductAbility, getIotWarringRulePage, deleteIotWarringRule,
} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
import EditAbilityModal from "./ability"
import EditProductModal from "./product"
import EditRuleModal from "./rule"
import {getProductStatusString, getSymbolEnumString, getWaringRuleStatusString} from "../../../utils/enum";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：10/18/21 - 10:21 AM
 * 描述：产品管理
 */
const { SubMenu } = Menu;
const { TabPane } = Tabs;

// 定义组件（ES6）
class Product extends Component {

    productRef = React.createRef();

    abilityRef = React.createRef();

    ruleRef = React.createRef();

    state = {
        // 返回的产品列表数据
        products: [],
        productMap:{},
        abilities:[],
        warrings:[],
        // 是否显示加载
        listLoading: false,
        // 本次已选择的产品id
        alreadySelectProduct:null
    };

    /**
     * 初始化Table所有列的数组
     */
    initAbilityColumns = () => {
        const _this = this;
        _this.abilityColumns = [
            {
                title: '属性名',
                dataIndex: 'name'
            },
            {
                title: '属性标识',
                dataIndex: 'property'
            },
            {
                title: '属性单位',
                render: (text, record) => {
                    return this.formatStandardUnit(record);
                }
            },
            {
                title: '读写标志',
                render: (text, record) => {
                    return this.formatRwFlag(record);
                }
            },
            {
                title: '数值范围',
                render: (text,record) => {
                    return this.formatScope(record);
                }
            },
            {
                title: '操作',
                render: (text, record) => (
                    <div>
                        <Button type="primary" title="编辑" onClick={() => this.handleModalAbilityEdit(record)} shape="circle" icon={<EditOutlined/>}/>
                        &nbsp;
                        <Button type="primary" danger title="删除" onClick={() => this.handleDellAbility(record)} shape="circle" icon={<DeleteOutlined />}/>
                    </div>
                ),
            },
        ]
    };

    /**
     * 初始化Table所有列的数组
     */
    initWarringColumns = () => {
        const _this = this;
        _this.warringcolumns = [
            {
                title: '告警名',
                dataIndex: 'name', // 显示数据对应的属性名
            },
            {
                title: '字段名',
                render: (text, record) => {
                    return _this.transformProperty(record.abilityEntity)
                }
            },
            {
                title: '规则',
                render: (text, record) => {
                    let uinit = _this.transformUinit(record.abilityEntity);
                    if (!record.symbol && 'RANGE' === record.symbol) {
                        return <span>大于等于<b>{record.value1}{uinit}</b>,小于等于<b>{record.value2}{uinit}</b></span>
                    } else {
                        return <span>{getSymbolEnumString(record.symbol)}<b>{record.value1}{uinit}</b></span>
                    }
                }
            },
            {
                title: '告警联动',
                render: (text, record) => {
                    return _this.transformCascade(record);
                }
            },
            {
                title: '启用状态',
                render: (text, record) => {
                    return getWaringRuleStatusString(record.enable);
                }
            },
            {
                title: '操作',
                render: (text, record) => (
                    <div>
                        <Button type="primary" title="编辑" onClick={() => this.handleModelRuleEdit(record)} shape="circle"
                                icon={<EditOutlined/>}/>
                        &nbsp;
                        <Button type="primary" danger title="删除" onClick={() => this.handleDellRule(record)}
                                shape="circle" icon={<DeleteOutlined/>}/>
                    </div>
                ),
            },
        ]
    };


    /**
     * 格式化标准物理量
     * @param record
     * @returns {string}
     */
    formatStandardUnit = (record) => {
        const result = (record)&&(record.standardUnit) ? record.standardUnit.name : '-';
        if ((record.type)&&(1===record.type)){
            const symbol = record&&record.standardUnit ? record.standardUnit.symbol : '-';
            return `${result}(${symbol})`
        } else {
            return result;
        }
    };

    /**
     * 格式化读写标志
     * @param record
     * @returns {string}
     */
    formatRwFlag = (record) => {
        if (1 === record.rwFlag){
            return "只读"
        } else if(2 === record.rwFlag){
            return "只写"
        }else if (3 === record.rwFlag){
            return "读写"
        } else {
            return "其它"
        }
    };

    /**
     * 格式化数值范围
     * @param record
     * @returns {string}
     */
    formatScope = (record) => {
      const scope = record.scopeParam;
        if ((record.type)&&(1===record.type)) {
            //return `起始值:${scope.beginThreshold},结束值:${scope.endThreshold}`;
            return `[${scope.beginThreshold},${scope.endThreshold}]`;
        }else{
            // 枚举类型
            const status = scope.status;
            let result = '';
            for(let key in status) {
                result += key + ":" + status[key] + " "
            }
            return result;
        }
    };

    /**
     * 格式化告警字段名
     * @param val
     * @returns {*}
     */
    transformProperty = (val) => {
        if (!val || !val.property) {
            return '-'
        } else {
            return val.property;
        }
    };

    /**
     * 格式化告警单位
     * @param val
     * @returns {*}
     */
    transformUinit = (val) => {
        if (!val || !val.standardUnit) {
            return '-'
        } else {
            return `${val.standardUnit.name}(${val.standardUnit.symbol})`;
        }
    };

    /**
     * 格式化级联指令字段
     * @param val
     * @returns {string}
     */
    transformCascade = (val) => {
        if (!val.eventAttribute || !val.eventValue){
            return '-';
        } else {
            return `向${val.eventAttribute}字段发送${val.eventValue}指令`
        }
    };



    /**
     * 获取产品列表数据
     * @returns {Promise<void>}
     */
    getProductDatas = async () => {
        const _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getProductList();
        // 在请求完成后, 隐藏loading
        let products = [];
        let productMap = {};
        let alreadySelectProduct = null;
        if (code === 0) {
            let index = 0;
            for (let key  in data) {
                let item = data[key];
                if (0 === index){
                  // 设置第一个为选中
                  alreadySelectProduct = item.id;
                }
                productMap[item.id] = item;
                products.push(<Menu.Item key={item.id}><div style={{width:"100%",display:"flex",alignItems:"center",justifyContent: "space-between"}}><span>{item.name}</span>
                    <Tooltip placement="right" trigger='click' color='#fff' title={<div>
                        <Button type="primary" shape="circle" onClick={()=>_this.deleteProduct(item.id)} icon={<LineOutlined />} size='small' danger/>&nbsp;
                        <Button type="primary" shape="circle" onClick={()=>_this.handleModalProductEdit(item)} icon={<EditOutlined />} size='small'/>&nbsp;
                        <Button type="primary" shape="circle" onClick={_this.handleModalAbilityAdd} icon={<CodeOutlined />} size='small'/>&nbsp;
                        <Button type="primary" shape="circle" onClick={()=>_this.handleModelRuleAdd(item.id)} icon={<WarningOutlined />} size='small'/>
                    </div>}>
                        <EllipsisOutlined/>
                    </Tooltip>
                </div></Menu.Item>)
              index = index + 1
            }
            _this.setState({
                products:products,
                productMap:productMap
            })
          if (alreadySelectProduct){
            _this.productSelect({key:alreadySelectProduct})
          }
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取产品物模型列表数据
     * @returns {Promise<void>}
     */
    getProductAbility = async (id) => {
        const _this = this;
        // 在发请求前, 显示loading
        //_this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getProductAbilityList(id);
        // 在发请求前, 显示loading
        //_this.setState({listLoading: false});
        if (code === 0) {
            // 在发请求前, 显示loading
            _this.setState({abilities: data});
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取产品告警规则数据
     * @returns {Promise<void>}
     */
    getProductWarringRule = async (productId) => {
        let _this = this;
        // 在发请求前, 显示loading
        //_this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getIotWarringRulePage(productId);
        // 在请求完成后, 隐藏loading
        //_this.setState({listLoading: false});
        if (code === 0) {
            _this.setState({
                // 表格数据
                warrings: data
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 用户所选产品发生改变
     * @param e
     */
    productSelect = (e) =>{
        if (!e || e.key === -1){
            return
        }
        this.setState({
            alreadySelectProduct:e.key
        });
        this.getProductAbility(e.key);
        this.getProductWarringRule(e.key);
    };


    /**
     * 删除产品
     * @param e
     */
    deleteProduct = async (e) => {
        const _this = this;
        const productId = _this.state.alreadySelectProduct;
        const {msg, code} = await deleteProduct(e);
        if (code === 0) {
            _this.getProductDatas();
            openNotificationWithIcon("success", "操作结果", "删除成功");
            _this.getProductAbility(productId);
            _this.getProductWarringRule(productId);
        }else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 显示物模型添加的弹窗
     */
    handleModalAbilityAdd = () => {
        this.abilityRef.handleDisplay({productId:this.state.alreadySelectProduct});
    };

    /**
     * 显示产品添加的弹窗
     */
    handleModalProductAdd = (e) => {
        e.stopPropagation();
        this.productRef.handleDisplay({});
    };

    /**
     * 显示告警规则添加的弹窗
     */
    handleModelRuleAdd = (productId) => {
        const _this = this;
        // 由于在执行添加前，已经发生了菜单的选中事件，已经执行了获取物模型告警的获取，所以无须重复执行
        this.ruleRef.handleDisplay({rule:{id:-1,productId:productId},abilities:_this.state.abilities,warrings:_this.state.warrings});
    };


    /**
     * 删除指定产品属性
     */
    handleDellAbility= (value) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `确认删除标识为:"${value.property}"的产品属性吗?一旦删除，该设备上报的"${value.property}"属性将被忽略解析，平台也无法通过该属性向设备发送指令！`,
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deleteProductAbility(value.id);
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "删除成功");
                    _this.refreshListFromAbilityModal();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    /**
     * 删除告警规则
     * @param value
     */
    handleDellRule = (value) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `确认删除名字为:"${value.name}"的告警规则吗?一旦删除，该告警规则所关联的设备告警规则也将解除关联`,
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deleteIotWarringRule({id:value.id,productId:value.productId});
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "删除成功");
                    const productId = _this.state.alreadySelectProduct;
                    _this.getProductWarringRule(productId);
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    /**
     * 显示物模型修改的弹窗
     * @param value
     * @returns {Promise<void>}
     */
    handleModalAbilityEdit = async (value) => {
        let _this = this;
        const temp = JSON.stringify(value);
        let val = JSON.parse(temp);
        const scope = value.scopeParam;
        const result = [];
        if ((value.type)&&(1===value.type)) {
            result.push({key:'begin',value:scope.beginThreshold});
            result.push({key:'end',value:scope.endThreshold});
        }else{
            // 枚举类型
            const status = scope.status;
            for(let key in status) {
                result.push({key:key,value:status[key]});
            }
        }
        val.scope = result;
        _this.abilityRef.handleDisplay(val);
    };

    /**
     * 显示产品修改的弹窗
     * @param value
     * @returns {Promise<void>}
     */
    handleModalProductEdit = (value) => {
        let _this = this;
        _this.productRef.handleDisplay(value);
    };

    /**
     * 显示告警规则修改的弹窗
     */
    handleModelRuleEdit = (val) => {
        const _this = this;
        // 由于在执行添加前，已经发生了菜单的选中事件，已经执行了获取物模型告警的获取，所以无须重复执行
        _this.ruleRef.handleDisplay({rule:val,abilities:_this.state.abilities,warrings:_this.state.warrings});
    };


    /**
     * 物模型添加或者修改组件ref绑定
     * @param ref
     */
    bindAbilityFormRef = (ref) => {
        this.abilityRef = ref
    };

    /**
     * 产品添加或者修改组件ref绑定
     * @param ref
     */
    bindProductFormRef = (ref) => {
        this.productRef = ref
    };

    /**
     * 告警规则的添加和修改组件ref绑定
     * @param ref
     */
    bindRuleFormRef = (ref) => {
        this.ruleRef = ref;
    };


    /**
     * 物模型绑定刷新事件（只刷新当前选择的产品下的物模型）
     */
    refreshListFromAbilityModal= () =>{
        const _this = this;
        const productId = _this.state.alreadySelectProduct;
        _this.getProductAbility(productId);
        _this.getProductWarringRule(productId);
    };

    /**
     * 产品绑定刷新事件
     */
    refreshListFromProductModal= () =>{
        const _this = this;
        _this.getProductDatas();
    };

    /**
     * 告警规则绑定刷新事件（只刷新当前选择的产品下的物模型）
     */
    refreshListFromRuleModal = () =>{
        const _this = this;
        const productId = _this.state.alreadySelectProduct;
        _this.getProductAbility(productId);
        _this.getProductWarringRule(productId);
    };


    /**
     * 执行异步任务: 发异步ajax请求
     */
    componentDidMount() {
        this.getProductDatas();
        this.initAbilityColumns();
        this.initWarringColumns();
        this.refreshListFromProductModal = this.refreshListFromProductModal.bind(this);
        this.refreshListFromAbilityModal = this.refreshListFromAbilityModal.bind(this);
        this.refreshListFromRuleModal = this.refreshListFromRuleModal.bind(this);
    }


    render() {
        const {products,productMap,listLoading,abilities,warrings,alreadySelectProduct} = this.state;
        let currentProduct = {id:null,name:null,status:null};
        if(productMap && alreadySelectProduct){
            currentProduct = productMap[alreadySelectProduct];
        }
        return (
            <DocumentTitle title='物联网智慧家庭·产品管理'>
                <section className="product-v1">
                    <Row className="product-data">
                        <Col span={5} className="tree-area">
                            <Menu mode="inline" defaultSelectedKeys={[(!alreadySelectProduct?'1':(alreadySelectProduct+''))]} defaultOpenKeys={['-1']} onSelect={this.productSelect}>
                                <SubMenu key="-1" icon={<MenuOutlined />} title={<div style={{width:"100%",display:"flex",alignItems:"center",justifyContent: "space-between"}}><span>全部</span><PlusOutlined onClick={this.handleModalProductAdd}/></div>}>
                                    {products}
                                </SubMenu>
                            </Menu>
                        </Col>
                        <Col span={19} className="table-area">
                            <table className="detail-table">
                                <colgroup>
                                    <col width="20%"/>
                                    <col width="30%"/>
                                    <col width="20%"/>
                                    <col width="30%"/>
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <td className="label">产品名</td>
                                        <td className="value" colSpan="3">{currentProduct?currentProduct.name:''}</td>
                                    </tr>
                                    <tr>
                                        <td className="label">产品ID</td>
                                        <td className="value">{currentProduct?currentProduct.id:''}</td>
                                        <td className="label">是否启用</td>
                                        <td className="value">{currentProduct?getProductStatusString(currentProduct.status):''}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab={<span><CodeOutlined/>数据模型</span>} key="1">
                                    <Table size="middle" rowKey="id" pagination={false} loading={listLoading} columns={this.abilityColumns} dataSource={abilities}/>
                                </TabPane>
                                <TabPane tab={<span><ControlOutlined/>告警规则</span>} key="2">
                                    <Table size="middle" rowKey="id" pagination={false} loading={listLoading} columns={this.warringcolumns} dataSource={warrings}/>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                    <EditProductModal onRef={this.bindProductFormRef.bind(this)} refreshList={this.refreshListFromProductModal}/>
                    <EditAbilityModal onRef={this.bindAbilityFormRef.bind(this)} refreshList={this.refreshListFromAbilityModal}/>
                    <EditRuleModal onRef={this.bindRuleFormRef.bind(this)} refreshList={this.refreshListFromRuleModal}/>
                </section>
            </DocumentTitle>
        );
  }
}

// 对外暴露
export default Product;
