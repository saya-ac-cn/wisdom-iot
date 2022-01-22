import React, { Component } from 'react';
import {Row, Col, Card, List, Skeleton, Modal, Select, Avatar} from "antd";
import {SyncOutlined,WarningOutlined} from '@ant-design/icons';
import DocumentTitle from 'react-document-title'
import "./index.less"
import {getLatestWarning} from "../../../api";
import {openNotificationWithIcon} from "../../../utils/window";
/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/7/18 - 10:33 上午
 * 描述：
 */

// 定义组件（ES6）
class DashBoard extends Component {

  state = {
    // 最近的告警列表数据
    latestWarningList: [],
    latestWarningListLoading: false,
  };

  /**
   * 获取最近的告警事件列表
   * @returns {Promise<void>}
   */
  getLatestWarningList = async () => {
    const _this = this;
    // 在发请求前, 显示loading
    _this.setState({latestWarningListLoading: true});
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getLatestWarning(10);
    // 在发请求前, 显示loading
    _this.setState({latestWarningListLoading: false});
    if (code === 0) {
      // 在发请求前, 显示loading
      _this.setState({latestWarningList: [{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":1,"clientId":null,"ruleId":null,"topic":"温度告警","content":"当前温度=21，超过阈值20","createTime":"2021-12-05 17:52:50","iotClient":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":2,"productId":null,"identifyUuid":null,"name":"郁金香温湿度采集","lastLinkTime":"2021-09-21 08:53:06","enable":null,"remove":null,"belongUser":null,"createTime":null,"updateTime":null,"productName":null,"authenInfo":null,"startTime":null},"iotRule":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":3,"name":"温度大于20摄氏度","productId":null,"abilityId":null,"symbol":null,"value1":null,"value2":null,"enable":null,"eventAttribute":null,"eventValue":null,"createTime":null,"updateTime":null,"abilityEntity":null,"startTime":null},"startTime":null}
      ,{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":1,"clientId":null,"ruleId":null,"topic":"温度告警","content":"当前温度=21，超过阈值20","createTime":"2021-12-05 17:52:50","iotClient":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":2,"productId":null,"identifyUuid":null,"name":"郁金香温湿度采集","lastLinkTime":"2021-09-21 08:53:06","enable":null,"remove":null,"belongUser":null,"createTime":null,"updateTime":null,"productName":null,"authenInfo":null,"startTime":null},"iotRule":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":3,"name":"温度大于20摄氏度","productId":null,"abilityId":null,"symbol":null,"value1":null,"value2":null,"enable":null,"eventAttribute":null,"eventValue":null,"createTime":null,"updateTime":null,"abilityEntity":null,"startTime":null},"startTime":null},{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":1,"clientId":null,"ruleId":null,"topic":"温度告警","content":"当前温度=21，超过阈值20","createTime":"2021-12-05 17:52:50","iotClient":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":2,"productId":null,"identifyUuid":null,"name":"郁金香温湿度采集","lastLinkTime":"2021-09-21 08:53:06","enable":null,"remove":null,"belongUser":null,"createTime":null,"updateTime":null,"productName":null,"authenInfo":null,"startTime":null},"iotRule":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":3,"name":"温度大于20摄氏度","productId":null,"abilityId":null,"symbol":null,"value1":null,"value2":null,"enable":null,"eventAttribute":null,"eventValue":null,"createTime":null,"updateTime":null,"abilityEntity":null,"startTime":null},"startTime":null}
      ,{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":1,"clientId":null,"ruleId":null,"topic":"温度告警","content":"当前温度=21，超过阈值20","createTime":"2021-12-05 17:52:50","iotClient":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":2,"productId":null,"identifyUuid":null,"name":"郁金香温湿度采集","lastLinkTime":"2021-09-21 08:53:06","enable":null,"remove":null,"belongUser":null,"createTime":null,"updateTime":null,"productName":null,"authenInfo":null,"startTime":null},"iotRule":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":3,"name":"温度大于20摄氏度","productId":null,"abilityId":null,"symbol":null,"value1":null,"value2":null,"enable":null,"eventAttribute":null,"eventValue":null,"createTime":null,"updateTime":null,"abilityEntity":null,"startTime":null},"startTime":null}
      ,{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":1,"clientId":null,"ruleId":null,"topic":"温度告警","content":"当前温度=21，超过阈值20","createTime":"2021-12-05 17:52:50","iotClient":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":2,"productId":null,"identifyUuid":null,"name":"郁金香温湿度采集","lastLinkTime":"2021-09-21 08:53:06","enable":null,"remove":null,"belongUser":null,"createTime":null,"updateTime":null,"productName":null,"authenInfo":null,"startTime":null},"iotRule":{"nowPage":null,"pageSize":null,"startLine":null,"endLine":null,"endTime":null,"id":3,"name":"温度大于20摄氏度","productId":null,"abilityId":null,"symbol":null,"value1":null,"value2":null,"enable":null,"eventAttribute":null,"eventValue":null,"createTime":null,"updateTime":null,"abilityEntity":null,"startTime":null},"startTime":null}]});
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  }

  /**
   * 执行异步任务: 发异步ajax请求
   */
  componentDidMount() {
    this.getLatestWarningList()
  }


  render() {
    const {latestWarningListLoading,latestWarningList} = this.state;
    return (
      <DocumentTitle title='物联网智慧家庭·远程控制'>
        <section className="chart-v1">
          <div className="chart-panel">
            <Col className="panel-left">
              <Row gutter={[16, 16]}>
                <Col span={11}>
                  <Card title={<span className='operation-color'>告警事件</span>} hoverable={true} extra={<SyncOutlined onClick={this.getLatestWarningList} className='operation-color'/>}>
                    <List
                      className="demo-loadmore-list"
                      loading={latestWarningListLoading}
                      itemLayout="horizontal"
                      dataSource={latestWarningList}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<WarningOutlined />} style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}/>}
                            title={item.topic}
                            description={`${!item.iotClient?'':item.iotClient.name}${item.content}[${item.createTime}]`}
                          />
                        </List.Item>
                      )}
                    />
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
