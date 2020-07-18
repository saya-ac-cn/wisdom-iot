import {notification} from 'antd';

// Notification通知提醒框
export const openNotificationWithIcon = (type, message, description) => notification[type]({
    placement: 'topRight',
    message: message,
    description: description,
});

export const openNotificationWithIcon_ = (type, message, description) => notification[type]({
    placement: 'bottomRight',
    message: message,
    description: description,
});
