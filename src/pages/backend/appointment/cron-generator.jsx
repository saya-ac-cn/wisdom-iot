import React,{Component} from 'react';
import {
  Input,
  Button,
  InputNumber,
  Tabs,
  Switch,
  Select,
  Radio,
  Checkbox,
  Row,
  Col,
  Descriptions,
  Icon,
} from 'antd';
import {CalendarOutlined} from '@ant-design/icons';
import {element} from 'prop-types';

/**
 * CRON表达式生成器
 */
  // 每个单选间的样式
const radioStyle = {display: 'block',height: '3em'};
const groupStyle = {display: 'flex',flexDirection: 'row',flexWrap: 'wrap',justifyContent: 'flex-start', paddingLeft: '1.7em'};
const numberInput = {width:'4em'};
// 当前年份
const currentYear = (new Date()).getFullYear();
class CronGenerator extends Component{

  constructor (props) {
    super (props);
  }

  state = {
    cronText: '* * * * * *',
    cronType: ['second', 'minute', 'hour', 'day', 'month', 'year'],
    radioValue: {
      second: 1,
      minute: 1,
      hour: 1,
      day: 1,
      month: 1,
      year: 1,
    },
    periodValue: {
      second: {max: 1, min: 1},
      minute: {max: 1, min: 1},
      hour: {max: 1, min: 1},
      day: {max: 1, min: 1},
      month: {max: 1, min: 1},
      year: {max: currentYear, min: (currentYear+1)},
    },
    loopValue: {
      second: {start: 1, end: 1},
      minute: {start: 1, end: 1},
      hour: {start: 1, end: 1},
      day: {start: 1, end: 1},
      month: {start: 1, end: 1},
      year: {start: currentYear, end: 1},
    },
    cron: {
      second: '*',
      minute: '*',
      hour: '*',
      day: '*',
      month: '*',
      year: '*',
    },
    cronParams: {
      second: '*',
      minute: '*',
      hour: '*',
      day: '*',
      month: '*',
      year: '*',
    },
  };

  componentWillReceiveProps() {
    const cron = this.props.cron
    if (cron && '' !== cron){
      this.setState ({cronText:cron});
    }
  }

  //生成cron
  createCron = async () => {
    let {cronType} = this.state;
    for (let type of cronType) {
      await this.cronGenerator (type);
    }
    let {second, minute, hour, day, month, year} = this.state.cron;
    let cronText =
      second + ' ' + minute + ' ' + hour + ' ' + day + ' ' + month + ' ' + year;
    this.setState ({
      cronText: cronText,
    });
    //this.props.setData (cronText);
    return cronText;
  };

  getCron = () => {
    return this.state.cronText
  }

  /**
   * cron生成器
   * @param type
   */
  cronGenerator = type => {
    let srv = this.state.radioValue[type];
    let period = this.state.periodValue[type];
    let loop = this.state.loopValue[type];
    let param = this.state.cronParams[type];
    let data = '';
    switch (srv) {
      case 1:
        data = '*';
        break;
      case 2:
        data = '?';
        break;
      case 'point':
        for (let v of param) {
          data = data + v + ',';
        }
        data = data.substring (0, data.length - 1);
        break;
      case 'period':
        data = period.min + '/' + period.max;
        break;
      case 'loop':
        data = loop.start + '/' + loop.end;
        break;
      default:
        data = '*';
    }
    this.setState ({
      cron: Object.assign (
        {},
        this.state.cron,
        this.cronItemGenerator (type, data)
      ),
    });
  };
  /**
   * 对象生成器
   * @param type
   * @param data
   * @returns {{second: *}|{minute: *}}
   */
  cronItemGenerator = (type, data) => {
    switch (type) {
      case 'second':
        return {second: data};
      case 'minute':
        return {minute: data};
      case 'hour':
        return {hour: data};
      case 'day':
        return {day: data};
      case 'month':
        return {month: data};
      case 'year':
        return {year: data};
    }
  };
  /**
   * 生成多选框
   * @param col 每行个数
   * @param minNum 最小值
   * @param maxNum 最大值
   * @param key
   */
  createCheckbox = (key, col, minNum, maxNum) => {
    let colArray = [];
    let rowArray = [];
    let count = col;
    let keyNum = minNum;
    for (minNum; minNum <= maxNum; minNum++) {
      rowArray.push(minNum)
    }
    return rowArray.map((key1) => {
      return (
        <Checkbox key={key + keyNum + key1} value={key1} style={{marginLeft: 0,marginTop:'.6em'}}>
          {this.formatNum(key1)}
        </Checkbox>
      )
    })
    // for (minNum; minNum <= maxNum; minNum++) {
    //   let checkbox = (
    //     <Checkbox key={key + keyNum} value={minNum}>
    //       {this.formatNum (minNum)}
    //     </Checkbox>
    //   );
    //   if (count > 0 && count < 9) {
    //     colArray.push (checkbox);
    //     count--;
    //     if (minNum === maxNum)
    //       rowArray.push (<Col key={key + keyNum}>{colArray}</Col>);
    //   } else {
    //     // style={{padding:'0 30'}}
    //     rowArray.push (<Col key={key + keyNum}>{colArray}</Col>);
    //     colArray = [];
    //     minNum--;
    //     count = col;
    //   }
    //   keyNum++;
    // }
    // return <Row className="checkoutRow">{rowArray}</Row>;
  };
  /**
   * 格式化0~9的数字
   * @param num
   */
  formatNum = num => {
    if (num < 10 && num > -1) {
      return '0' + num;
    }
    return num;
  };

  handleRadioChange = (e, type) => {
    this.setState ({
      radioValue: Object.assign (
        {},
        this.state.radioValue,
        this.cronItemGenerator (type, e.target.value)
      ),
    });
  };

  handleCheckboxChange = (checkedValues, type) => {
    this.setState ({
      cronParams: Object.assign (
        {},
        this.state.cronParams,
        this.cronItemGenerator (type, checkedValues)
      ),
    });
  };

  handlePeriodChange = (e, type, tar) => {
    let data = this.state.periodValue;
    data[type] = tar === 'max'
      ? {max: e, min: data[type].min}
      : {max: data[type].max, min: e};
    this.setState ({
      periodValue: Object.assign (
        {},
        this.state.periodValue,
        this.cronItemGenerator (type, data[type])
      ),
    });
  };

  handleLoopChange = (e, type, tar) => {
    let data = this.state.loopValue;
    data[type] = tar === 'start'
      ? {start: e, end: data[type].end}
      : {start: data[type].start, end: e};
    this.setState ({
      loopValue: Object.assign (
        {},
        this.state.loopValue,
        this.cronItemGenerator (type, data[type])
      ),
    });
  };

  componentDidMount () {
    const _this = this;
    _this.props.onRef(_this);
  }

  render () {
    const {TabPane} = Tabs;
    const {cronText, radioValue} = this.state;
    const {Search} = Input;
    const secondCheckbox = this.createCheckbox ('second', 10, 0, 59);
    const minuteCheckbox = this.createCheckbox ('minute', 10, 0, 59);
    const hourCheckbox = this.createCheckbox ('hour', 10, 0, 23);
    const dayCheckbox = this.createCheckbox ('day', 10, 1, 31);
    const monthCheckbox = this.createCheckbox ('month', 10, 1, 12);
    const yearCheckbox = this.createCheckbox ('year', 10, currentYear, 2100);
    return (
      <div className='cron-generator'>
        <Tabs type="card">
          <TabPane tab={<span><CalendarOutlined />秒</span>} key="1">
            <Radio.Group onChange={e => this.handleRadioChange (e, 'second')} value={radioValue['second']}>
              <Radio style={radioStyle} value={1}>
                每秒执行
              </Radio>
              <Radio style={radioStyle} value="period">
                从
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'second', 'min')}/>
                秒开始，到
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'second', 'max')}/>
                秒结束
              </Radio>
              <Radio style={radioStyle} value="loop">
                从
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handleLoopChange (e, 'second', 'start')}/>
                秒开始，每隔
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handleLoopChange (e, 'second', 'end')}/>
                秒执行一次
              </Radio>
              <Radio style={radioStyle} value="point">指定</Radio>
              <Checkbox.Group style={groupStyle} onChange={ e => this.handleCheckboxChange (e, 'second')}>
                {secondCheckbox}
              </Checkbox.Group>
            </Radio.Group>
          </TabPane>
          <TabPane tab={<span><CalendarOutlined />分</span>} key="2">
            <Radio.Group value={radioValue['minute']} onChange={e => this.handleRadioChange (e, 'minute')}>
              <Radio style={radioStyle} value={1}>
                每分执行
              </Radio>
              <Radio style={radioStyle} value="period">
                从
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'minute', 'min')}/>
                分开始，到
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'minute', 'max')}/>
                分结束
              </Radio>
              <Radio style={radioStyle} value="loop">
                从
                <InputNumber size="small" style={numberInput}min={1} max={59} defaultValue={1} onChange={e => this.handleLoopChange (e, 'minute', 'start')}/>
                分开始，每隔
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handleLoopChange (e, 'minute', 'end')}/>
                分执行一次
              </Radio>
              <Radio style={radioStyle} value="point">指定</Radio><br />
              <Checkbox.Group style={groupStyle} onChange={e => this.handleCheckboxChange (e, 'minute')}>
                {minuteCheckbox}
              </Checkbox.Group>
            </Radio.Group>
          </TabPane>
          <TabPane tab={<span><CalendarOutlined />时</span>} key="3">
            <Radio.Group onChange={e => this.handleRadioChange (e, 'hour')} value={radioValue['hour']}>
              <Radio style={radioStyle} value={1}>
                每小时执行
              </Radio>
              <Radio style={radioStyle} value="period">
                从
                <InputNumber size="small" style={numberInput}min={0} max={23} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'hour', 'min')}/>
                时开始，到
                <InputNumber size="small" style={numberInput} min={0} max={23} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'hour', 'max')}/>
                时结束
              </Radio>
              <Radio style={radioStyle} value="loop">
                从
                <InputNumber size="small" style={numberInput} min={0} max={23} defaultValue={1} onChange={e => this.handleLoopChange (e, 'hour', 'start')}/>
                时开始，每隔
                <InputNumber size="small" style={numberInput} min={1} max={59} defaultValue={1} onChange={e => this.handleLoopChange (e, 'hour', 'end')}/>
                时执行一次
              </Radio>
              <Radio style={radioStyle} value="point">指定</Radio><br />
              <Checkbox.Group style={groupStyle} onChange={e => this.handleCheckboxChange (e, 'hour')}>
                {hourCheckbox}
              </Checkbox.Group>
            </Radio.Group>
          </TabPane>
          <TabPane tab={<span><CalendarOutlined />日</span>} key="4">
            <Radio.Group onChange={e => this.handleRadioChange (e, 'day')} value={radioValue['day']}>
              <Radio style={radioStyle} value={1}>
                每日执行
              </Radio>
              <Radio style={radioStyle} value={2}>
                不指定
              </Radio>
              <Radio style={radioStyle} value="period">
                从
                <InputNumber size="small" style={numberInput} min={1} max={31} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'day', 'min')}/>
                日开始，到
                <InputNumber size="small" style={numberInput} min={1} max={31} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'day', 'max')}/>
                日结束
              </Radio>
              <Radio style={radioStyle} value="loop">
                从
                <InputNumber size="small" style={numberInput} min={1} max={31} defaultValue={1} onChange={e => this.handleLoopChange (e, 'day', 'start')}/>
                日开始，每隔
                <InputNumber size="small" style={numberInput} min={1} max={31} defaultValue={1} onChange={e => this.handleLoopChange (e, 'day', 'end')}/>
                日执行一次
              </Radio>
              <Radio style={radioStyle} value="point">指定</Radio>
              <Checkbox.Group style={groupStyle} onChange={e => this.handleCheckboxChange (e, 'day')} >
                {dayCheckbox}
              </Checkbox.Group>
            </Radio.Group>
          </TabPane>
          <TabPane tab={<span><CalendarOutlined />月</span>} key="5">
            <Radio.Group onChange={e => this.handleRadioChange (e, 'month')} value={radioValue['month']}>
              <Radio style={radioStyle} value={1}>
                每月执行
              </Radio>
              <Radio style={radioStyle} value="period">
                从
                <InputNumber size="small" style={numberInput} min={1} max={12} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'month', 'min')}/>
                月开始，到
                <InputNumber size="small" style={numberInput} min={1} max={12} defaultValue={1} onChange={e => this.handlePeriodChange (e, 'month', 'max')}/>
                月结束
              </Radio>
              <Radio style={radioStyle} value="loop">
                从
                <InputNumber size="small" style={numberInput} min={1} max={12} defaultValue={1} onChange={e => this.handleLoopChange (e, 'month', 'start')} />
                月开始，每隔
                <InputNumber size="small" style={numberInput} min={1} max={12} defaultValue={1} onChange={e => this.handleLoopChange (e, 'month', 'end')}/>
                月执行一次
              </Radio>
              <Radio style={radioStyle} value="point"> 指定 </Radio>
              <Checkbox.Group style={groupStyle} onChange={e => this.handleCheckboxChange (e, 'month')}>
                {monthCheckbox}
              </Checkbox.Group>
            </Radio.Group>
          </TabPane>
          <TabPane tab={<span><CalendarOutlined />年</span>} key="6" >
            <Radio.Group onChange={e => this.handleRadioChange (e, 'year')} value={radioValue['year']} >
              <Radio style={radioStyle} value={1}>
                每年执行
              </Radio>
              <Radio style={radioStyle} value="loop">
                从
                <InputNumber size="small" style={{width: '7em'}} min={currentYear} max={2100} defaultValue={currentYear} onChange={e => this.handleLoopChange (e, 'year', 'start')} />
                年开始，每隔
                <InputNumber size="small" style={numberInput} min={1} max={20} defaultValue={1} onChange={e => this.handleLoopChange (e, 'year', 'end')}/>
                年执行一次
              </Radio>
              <Radio style={radioStyle} value="period">
                从
                <InputNumber size="small" style={{width: '7em'}} min={currentYear} max={2100} defaultValue={currentYear} onChange={e => this.handlePeriodChange (e, 'year', 'min')}/>
                年开始，到
                <InputNumber size="small" style={{width: '7em'}} min={currentYear} max={2100} defaultValue={currentYear+1} onChange={e => this.handlePeriodChange (e, 'year', 'max')}/>
                年之间的每一年
              </Radio>
              <Radio style={radioStyle} value="point">指定</Radio>
              <Checkbox.Group style={groupStyle} onChange={e => this.handleCheckboxChange (e, 'year')}>
                {yearCheckbox}
              </Checkbox.Group>
            </Radio.Group>
          </TabPane>
        </Tabs>
        <Search placeholder="生成Cron" style={{width:'20em',marginTop: '2em',marginBottom:'2em'}} enterButton="生成" onSearch={this.createCron} value={cronText}/>
        <Descriptions title="Ps:">
          <Descriptions.Item label="第1步">
            在设置完Cron参数后，请点击生成按钮，然后再提交保存
          </Descriptions.Item>
          <Descriptions.Item label="第2步">
            提交前，请仔细检查生成Cron是不是正确无误，确保和业务相符后再提交
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  }

}
export default CronGenerator;
