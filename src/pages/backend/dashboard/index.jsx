import React, { Component } from 'react';
import DocumentTitle from 'react-document-title'
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
        <div>
          34567890<br/>
          34567890<br/>
          34567890<br/>
          34567890<br/>
          34567890<br/>
          34567890<br/>
          34567890<br/>
          34567890<br/>34567890<br/>
          34567890<br/>
        </div>
      </DocumentTitle>
    );
  }
}

// 对外暴露
export default DashBoard;
