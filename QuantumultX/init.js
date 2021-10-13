/**
 * 初始化变量脚本:
 * 用于本地化私有变量
 */


(async function main () {
  // TG 通知配置
  $prefs.setValueForKey('api.telegram.org', 'TG_API_HOST');
  $prefs.setValueForKey('', 'TG_BOT_TOKEN');
  $prefs.setValueForKey('', 'TG_USER_ID');
  
  // wey.js 配置
  $prefs.setValueForKey('', 'wey_beanId');
  $prefs.setValueForKey('', 'wey_cVer');
  $notify("变量初始化通知", '', '变量初始化成功!')
})