// 基础类
import ButtonGroup from './base/button/ButtonGroup'
import RadioButtonGroup from './base/button/RadioButtonGroup'

// 视图类
import Modal from './view/modal/Modal'
import Gallery from './view/gallery/Gallery'
import XTable from './view/table/XTable'
import IntelligentTable from './view/table/IntelligentTable'
import InfoCard from './view/info/InfoCard'
import InfoList from './view/info/InfoList'
import SearchBox from './view/search/SearchBox'

// 表单类
import Editor from './form/editor/Editor'
import DatePicker from './form/date-picker/DatePicker'
import DatePicker2 from './form/date-picker/DatePicker2'
import DateTimePicker from './form/date-picker/DateTimePicker'
import DateTimeMultiplePicker from './form/date-picker/DateTimeMultiplePicker'
import DateTimeRangePicker from './form/date-picker/DateTimeRangePicker'
import DateTimeSinglePicker from './form/date-picker/DateTimeSinglePicker'
import TimePicker from './form/date-picker/TimePicker'
import TimePicker2 from './form/date-picker/TimePicker2'
import FileUploader from './form/uploader/FileUploader'
import ImageUploader from './form/uploader/ImageUploader'
import ImageUploaderSplashWnd from './form/uploader/ImageUploaderSplashWnd'
import XSelect from './form/select/Select'
import Switch from './form/switch/Switch'
import Radio from './form/radio/Radio'
import Captcha from './form/captcha/Captcha'
import AreaSelect from './form/cascader/AreaSelect'
import Range from './form/range/Range'
import TagInput from './form/input/TagInput'

// 导航类
import Pagination from './navigation/pagination/Pagination'
import Breadcrumb from './navigation/breadcrumb/Breadcrumb'

const components = {
  ButtonGroup,
  RadioButtonGroup,
  Modal,
  Gallery,
  XTable,
  IntelligentTable,
  InfoCard,
  InfoList,
  SearchBox,
  Editor,
  DatePicker,
  DatePicker2,
  DateTimePicker,
  DateTimeMultiplePicker,
  DateTimeRangePicker,
  DateTimeSinglePicker,
  TimePicker,
  TimePicker2,
  FileUploader,
  ImageUploader,
  ImageUploaderSplashWnd,
  XSelect,
  Switch,
  Radio,
  Captcha,
  AreaSelect,
  Range,
  TagInput,
  Pagination,
  Breadcrumb
}

const install = function (Vue, opts = {}) {
  if (install.installed) return

  // 注册全局方法和变量

  // 注册全局指令

  // 注册全局过滤器

  // 注册全局组件
  for (let name in components) {
    Vue.component(name, components[name])
  }
}

export default {
  install
}
