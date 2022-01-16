import React, { Component } from 'react';
import {Row, Col, Card, Form, Input, Modal, Select, Table} from "antd";
import {SyncOutlined} from '@ant-design/icons';
import DocumentTitle from 'react-document-title'
import "./index.less"
/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/7/18 - 10:33 上午
 * 描述：
 */

// 定义组件（ES6）
class DashBoard extends Component {

  constructor(props){
    super(props)
  }


  render() {
    return (
      <DocumentTitle title='物联网智慧家庭·远程控制'>
        <section className="chart-v1">
          <div className="chart-panel">
            <Col className="panel-left">
              <Row gutter={[16, 16]}>
                <Col span={11}>
                  <Card title={<span className='operation-color'>告警事件</span>} hoverable={true} extra={<SyncOutlined className='operation-color'/>}>
                    <p>Card content</p>
                    <p>Card content</p>
                    <p>Card content</p>
                  </Card>
                </Col>
                <Col span={13}>
                  <Card title={<span className='operation-color'>上报趋势</span>} hoverable={true} extra={<SyncOutlined className='operation-color'/>}>
                    <p>Card content</p>
                    <p>Card content</p>
                    <p>Card content</p>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title={<span className='operation-color'>产品概览</span>} hoverable={true} extra={<SyncOutlined className='operation-color'/>}>
                    <p>Card content</p>
                    <p>Card content</p>
                    <p>Card content</p>
                  </Card>
                </Col>
              </Row>
            </Col>
            <div className='panel-right'>
              <Card className='client-panel' title={<span className='operation-color'>设备概览</span>} hoverable={true} extra={<SyncOutlined className='operation-color'/>}>
                 <p>Card content</p>
                  <p>Card content</p>
                </Card>
            </div>
          </div>
        </section>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default DashBoard;
