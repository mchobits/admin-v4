import * as http from 'src/http'
import { API_SERVER } from 'consts/config'

export default {
  /**
   * 获取用户自定义属性
   * @param  {[type]} params 参数
   * @return {[type]}        [description]
   */
  getUserCustomization () {
    return http.get(
      `${API_SERVER.default}/v2/customization?id=corp.user.list`
    )
  },

  /**
   * 设置用户自定义属性
   * @param  {[type]} params 参数
   * @return {[type]}        [description]
   */
  setUserCustomization (params) {
    return http.post(
      `${API_SERVER.default}/v2/customization?id=corp.user.list`, params
    )
  },

  /**
   * 获取设备自定义属性
   * @param  {[type]} params 参数
   * @return {[type]}        [description]
   */
  getDeviceCustomization (productId) {
    return http.get(
      `${API_SERVER.default}/v2/customization?id=corp.${productId}.device.list`
    )
  },

  /**
   * 设置设备自定义属性
   * @param  {[type]} params 参数
   * @return {[type]}        [description]
   */
  setDeviceCustomization (productId, params) {
    return http.post(
      `${API_SERVER.default}/v2/customization?id=corp.${productId}.device.list`, params
    )
  },

  /**
   * 获取产品自定义属性
   * @param  {[type]} params 参数
   * @return {[type]}        [description]
   */
  getProductCustomization (productId) {
    return http.get(
      `${API_SERVER.default}/v2/customization?id=corp.product.${productId}.list`
    )
  },

  /**
   * 设置产品自定义属性
   * @param  {[type]} params 参数
   * @return {[type]}        [description]
   */
  setProductCustomization (productId, params) {
    return http.post(
      `${API_SERVER.default}/v2/customization?id=corp.product.${productId}.list`, params
    )
  }
}
