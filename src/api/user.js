import * as http from '../http'
import { apiServer } from '../consts/config'

export default {
  /**
   * 用户列表查询
   * @param  {Object} params
    {
      "offset":"请求列表的偏移量",
      "limit":"请求数量",
      "filter":["字段A","字段B"],
      "query":
      {
        "filed1":{"$in":["字段值","字段值"]},
        "filed3":{"$lt":"字段值"}
      },
      "order":
      {
        "filed1":"desc",
        "filed2":"asc"
      }
    }
   * @return {Promise}
    {
      "count" : "实际返回数量",
      "list" :
      [
        {
          "id" : "用户ID",
          "phone/email" : "手机号/邮箱",
          "nickname" : "用户昵称",
          "authorize_code":"认证码",
          "create_date" : "创建时间",
          "source" : "用户来源"
        }
      ]
    }
   */
  list (params) {
    return http.post(
      `${apiServer.default}/v2/users`, params
    )
  },

  /**
   * 获取用户详细信息
   * @param  user_id
   * @return {Promise}
    {
      "id" : "用户ID",
      "corp_id":"企业ID",
      "phone/email" : "手机号/邮箱",
      "nickname" : "用户昵称",
      "authorize_code":"认证码",
      "create_date" : "创建时间",
      "source" : "用户来源",
      "region_id":"所在区域ID"
    }
   */
  profile (user_id) {
    return http.get(
      `${apiServer.default}/v2/user/${user_id}`
    )
  },

  /**
   * 获取用户订阅的设备列表
   * @param  {Object} params 重置密码参数信息
   * @return {Promise}
      [
        {
          "id" : "设备ID",
          "mac" : "设备MAC地址",
          "is_active" : "是否激活",
          "active_date" : "激活时间",
          "is_online" : "是否在线",
          "last_login" : "最近登录时间",
          "active_code" : "激活码",
          "authorize_code" : "认证码",
          "mcu_mod" : "MCU型号",
          "mcu_version" : "MCU版本号",
          "firmware_mod" : "固件型号",
          "firmware_version" : "固件版本号",
          "product_id" : "所属的产品ID"
        }
      ]
   */
  subDeviceList (user_id) {
    return http.get(
      `${apiServer.default}/v2/user/${user_id}/subscribe/devices`
    )
  },

  /**
   * 停用用户
   * 成员编辑本成员的基本信息。
   * @param  {Object} params  {"name":"成员姓名"}
   * @param  {member_id}
   * @return  stauts
   */
  banMember (user_id) {
    return http.put(
      `${apiServer.default}/v2/user/${user_id}/status`
    )
  },

  /**
   * 添加成员
   * 成员编辑本成员的基本信息。
   * @param  {Object} params  {"name":"成员姓名"}
   * @param  {member_id}
   * @return  stauts
   */
  addMember (params) {
    return http.post(
      `${apiServer.default}/v2/corp/member_add`, params
    )
  },
  /**
   * 修改成员密码
   * 成员编辑本成员的基本信息。
   * @param  {Object} params  {"name":"成员姓名"}
   * @param  {member_id}
   * @return  stauts
   */
  editMember (member_id, params) {
    return http.put(
      `${apiServer.default}/v2/corp/member/${member_id}/password`, params
    )
  },

  /**
   * 新版停用启用用户
   * 成员编辑本成员的基本信息。
   * @param  {Object} params  {"name":"成员姓名"}
   * @param  {member_id}
   * @return  stauts
   */
  toggleMember (user_id, status) {
    return http.put(
      `${apiServer.default}/v2/user/${user_id}/status/${status}`
    )
  }
}
