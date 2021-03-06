import * as http from 'src/http'
import { API_SERVER } from 'consts/config'
export default {
  /**
   * 查询用户反馈分组
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  getFeedbackGroup (appID, params) {
    return http.post(
      `${API_SERVER.feedback}/${appID}/api/feedback/group`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },

  /**
   * 查询用户反馈列表
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  getFeedbackList (appID, params) {
    return http.post(
      `${API_SERVER.feedback}/${appID}/api/feedback/list`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },
  /**
   * 更新用户反馈列表
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  updateFeedbackList (appID, feedbackId, params) {
    return http.put(
      `${API_SERVER.feedback}/${appID}/api/feedback/update/${feedbackId}`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },

  /**
   * 查询标签
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  getFeedbackLabel (appID) {
    return http.post(
      `${API_SERVER.feedback}/${appID}/api/feedback_label/list`, {}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },

  /**
   * 添加标签
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  saveFeedbackLabel (appID, params) {
    return http.post(
      `${API_SERVER.feedback}/${appID}/api/feedback_label/save`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },

  /**
   * 修改标签
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  putFeedbackLabel (appID, labelID, params) {
    return http.put(
      `${API_SERVER.feedback}/${appID}/api/feedback_label/update/${labelID}`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },

  /**
   * 删除标签
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  delFeedbackLabel (appID, labelID) {
    return http.del(
      `${API_SERVER.feedback}/${appID}/api/feedback_label/delete/${labelID}`, {}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },

  /**
   * 查询处理记录
   * @param  {string} appID, {string} token {object} params
   * @return promise
   */
  getFeedbackRecordList (appID, params) {
    return http.post(
      `${API_SERVER.feedback}/${appID}/api/feedback_record/list`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  },
   /**
    * 增加处理记录
    * @param  {string} appID, {string} token {object} params
    * @return promise
    */
  saveFeedbackRecord (appID, params) {
    return http.post(
      `${API_SERVER.feedback}/${appID}/api/feedback_record/save`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Token': JSON.parse(window.localStorage.pluginsToken)[appID].token
        }
      }
    )
  }
}
