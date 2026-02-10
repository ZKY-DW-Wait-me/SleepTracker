/**
 * SleepTracker - 应用配置
 * 集中管理备案号、版权信息等敏感/可变配置
 *
 * 注意：React Native 不支持直接读取 .env 文件，
 * 需安装 react-native-config 等库才能读取环境变量。
 * 目前采用直接配置的方式，修改此文件即可。
 */

const AppConfig = {
  /** ICP 备案号（留空则不显示） */
  APP_ICP_NUMBER: 'xICP备号xxxxxxxx号-x',

  /** 公安网备号（留空则不显示） */
  APP_POLICE_RECORD: '',

  /** 开发者名称 */
  APP_DEVELOPER_NAME: 'ZKY-DW-Wait-me',

  /** 开源协议 */
  APP_LICENSE: 'GPL License',

  /** 应用版本号 */
  APP_VERSION: '1.1.3',
};

export default AppConfig;
