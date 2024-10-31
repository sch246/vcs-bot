// modules/api/types.ts

import { IModule } from '../../core/types';
import { honerOne, Sender, Status } from './types/base';
import { ArrayMessage, Message, NodeSegment } from './types/message';
export * from './types/message'
export * from './types/event'

export interface IAPI extends IModule {
  /**
   * 发送私聊消息
   * @param message 要发送的消息内容
   * @param user_id 接收者的 QQ 号
   * @param auto_escape 是否将消息内容作为纯文本发送，默认为 false
   * @returns 消息 ID
   */
  send_private_msg: (
    message: Message,
    user_id: number,
    auto_escape?: boolean,
  ) => Promise<{
    message_id: number,
  }>

  /**
   * 发送群消息
   * @param message 要发送的消息内容
   * @param group_id 群号
   * @param auto_escape 是否将消息内容作为纯文本发送，默认为 false
   * @returns 消息 ID
   */
  send_group_msg: (
    message: Message,
    group_id: number, 
    auto_escape?: boolean
  ) => Promise<{
    message_id: number
  }>

  /**
   * 发送消息
   * @param message 要发送的消息内容
   * @param params 可选参数
   * - `user_id` 对方 QQ 号（消息类型为 private 时需要）
   * - `group_id` 群号（消息类型为 group 时需要）
   * - `auto_escape` 是否将消息内容作为纯文本发送，默认为 false
   * - `message_type` 消息类型，支持 private、group，分别对应私聊、群组，如不传入，则根据传入的 *_id 参数判断
   * @returns 消息 ID
   */
  send_msg: (
    message: Message,
    params: {
      user_id?: number,
      group_id?: number,
      auto_escape?: boolean,
      message_type?: 'private' | 'group',
    }
  ) => Promise<{
    message_id: number
  }>

  /**
   * 撤回消息
   * @param message_id 要撤回的消息 ID
   */
  delete_msg: (message_id: number) => Promise<void>

  /**
   * 获取消息
   * @param message_id 消息 ID
   * @returns Promise
   * - `time` 发送时间
   * - `message_type` 消息类型
   * - `message_id` 消息 ID
   * - `real_id` 消息真实 ID
   * - `sender` 发送人信息
   * - `message` 消息内容
   */
  get_msg: (message_id: number) => Promise<{
    time: number,
    message_type: string,
    message_id: number,
    real_id: number,
    sender: Sender,
    message: ArrayMessage
  }>

  /**
   * 获取合并转发消息
   * @param id 合并转发 ID
   * @returns Promise 返回合并转发的消息内容
   */
  get_forward_msg: (id: string) => Promise<{
    message: NodeSegment[]  
  }>

  /**
   * 发送好友赞
   * @param user_id 对方 QQ 号
   * @param times 赞的次数，每个好友每天最多 10 次，默认 1
   */
  send_like: (user_id: number, times?: number) => Promise<void>

  /**
   * 群组踢人
   * @param group_id 群号
   * @param user_id 要踢的 QQ 号
   * @param reject_add_request 是否拒绝此人的加群请求，默认为 false
   */
  set_group_kick: (
    group_id: number,
    user_id: number,
    reject_add_request?: boolean
  ) => Promise<void>

  /**
   * 群组单人禁言
   * @param group_id 群号
   * @param user_id 要禁言的 QQ 号
   * @param duration 禁言时长，单位秒，0 表示取消禁言，默认为 30 分钟
   */
  set_group_ban: (
    group_id: number,
    user_id: number, 
    duration?: number
  ) => Promise<void>

  /**
   * 群组匿名用户禁言
   * @param group_id 群号
   * @param params 可选参数
   * - `anonymous` 要禁言的匿名用户对象（群消息上报的 anonymous 字段）
   * - `anonymous_flag` 要禁言的匿名用户的 flag（需从群消息上报的数据中获得）
   * - `flag` 同上，二选一
   * - `duration` 禁言时长，单位秒，无法取消匿名用户禁言，默认 30*60 (半小时)
   */
  set_group_anonymous_ban: (
    group_id: number,
    params: {
      anonymous?: object,
      anonymous_flag?: string,
      flag?: string,
      duration?: number  
    }
  ) => Promise<void>

  /**
   * 群组全员禁言
   * @param group_id 群号
   * @param enable 是否启用全员禁言，默认为 true
   */
  set_group_whole_ban: (
    group_id: number,
    enable?: boolean
  ) => Promise<void>

  /**
   * 设置群组管理员
   * @param group_id 群号
   * @param user_id 要设置为管理员的 QQ 号
   * @param enable true 为设置管理员，false 为取消，默认 true
   */
  set_group_admin: (
    group_id: number,
    user_id: number,
    enable?: boolean
  ) => Promise<void>

  /**
   * 群组匿名设置
   * @param group_id 群号
   * @param enable 是否允许匿名聊天，默认为 true
   */
  set_group_anonymous: (
    group_id: number,
    enable?: boolean  
  ) => Promise<void>

  /**
   * 设置群名片（群备注）
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param card 群名片内容，不填或空字符串表示删除群名片
   */
  set_group_card: (
    group_id: number,
    user_id: number,
    card?: string
  ) => Promise<void>

  /**
   * 设置群名
   * @param group_id 群号
   * @param group_name 新群名
   */
  set_group_name: (
    group_id: number,
    group_name: string
  ) => Promise<void>

  /**
   * 退出群组
   * @param group_id 群号
   * @param is_dismiss 是否解散群组，仅在登录号是群主时有效，默认为 false
   */
  set_group_leave: (
    group_id: number,
    is_dismiss?: boolean
  ) => Promise<void>

  /**
   * 设置群组专属头衔
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param special_title 专属头衔，不填或空字符串表示删除专属头衔
   * @param duration 专属头衔有效期，单位秒，-1 表示永久 此项似乎没有效果
   */
  set_group_special_title: (
    group_id: number,
    user_id: number,
    special_title?: string,
    duration?: number
  ) => Promise<void>

  /**
   * 处理加好友请求
   * @param flag 加好友请求的 flag（需从上报的数据中获得）
   * @param approve 是否同意请求，默认 true
   * @param remark 添加后的好友备注（仅在同意时有效）
   */
  set_friend_add_request: (
    flag: string,  
    approve?: boolean, 
    remark?: string  
  ) => Promise<void>

  /**
   * 处理加群请求／邀请
   * @param flag 加群请求的 flag（需从上报的数据中获得）
   * @param sub_type 请求类型，'add' 或 'invite'
   * @param approve 是否同意请求／邀请，默认 true
   * @param reason 拒绝理由（仅在拒绝时有效）
   */
  set_group_add_request: (
    flag: string,
    sub_type: 'add' | 'invite',
    approve?: boolean, 
    reason?: string  
  ) => Promise<void>

  /**
   * 获取登录号信息
   * @returns Promise
   * - `user_id` QQ 号
   * - `nickname` QQ 昵称
   */
  get_login_info: () => Promise<{
    user_id: number,
    nickname: string  
  }>

  /**
   * 获取陌生人信息
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存，默认为 false
   * @returns Promise
   * - `user_id` QQ 号
   * - `nickname` 昵称
   * - `sex` 性别，male 或 female 或 unknown
   * - `age` 年龄
   */
  get_stranger_info: (
    user_id: number,
    no_cache?: boolean
  ) => Promise<{
    user_id: number,
    nickname: string,
    sex: 'male' | 'female' | 'unknown',
    age: number
  }>

  /**
   * 获取好友列表
   * @returns Promise Array
   * - `user_id` QQ 号
   * - `nickname` 昵称
   * - `remark` 备注名
   */
  get_friend_list: () => Promise<Array<{
    user_id: number,
    nickname: string,
    remark: string
  }>>

  /**
   * 获取群信息
   * @param group_id 群号
   * @param no_cache 是否不使用缓存，默认为 false
   * @returns Promise
   * - `group_id` 群号
   * - `group_name` 群名称
   * - `member_count` 成员数
   * - `max_member_count` 最大成员数（群容量）
   */
  get_group_info: (
    group_id: number,
    no_cache?: boolean
  ) => Promise<{
    group_id: number,
    group_name: string,
    member_count: number,
    max_member_count: number
  }>

  /**
   * 获取群列表
   * @returns Promise Array
   * - `group_id` 群号
   * - `group_name` 群名称
   * - `member_count` 成员数
   * - `max_member_count` 最大成员数（群容量）
   */
  get_group_list: () => Promise<Array<{
    group_id: number,
    group_name: string,
    member_count: number,
    max_member_count: number  
  }>>

  /**
   * 获取群成员信息
   * @param group_id 群号
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存，默认为 false
   * @returns Promise 返回群成员的详细信息
   * - `group_id` 群号
   * - `user_id` QQ 号
   * - `nickname` 昵称
   * - `card` 群名片／备注
   * - `sex` 	性别，male 或 female 或 unknown
   * - `age` 年龄
   * - `area` 地区
   * - `join_time` 加群时间戳
   * - `last_sent_time` 最后发言时间戳
   * - `level` 成员等级
   * - `role` 角色，owner 或 admin 或 member
   * - `unfriendly` 是否不良记录成员
   * - `title` 专属头衔
   * - `title_expire_time` 专属头衔过期时间戳
   * - `card_changeable` 是否允许修改群名片
   */
  get_group_member_info: (
    group_id: number,
    user_id: number,
    no_cache?: boolean
  ) => Promise<{
    group_id: number,
    user_id: number,
    nickname: string,
    card: string,
    sex: 'male' | 'female' | 'unknown',
    age: number,
    area: string,
    join_time: number,
    last_sent_time: number,
    level: string,
    role: 'owner' | 'admin' | 'member',
    unfriendly: boolean,
    title: string,
    title_expire_time: number,
    card_changeable: boolean
  }>

  /**
   * 获取群成员列表
   * @param group_id 群号
   * @returns Promise Array 返回群成员列表
   * - `group_id` 群号
   * - `user_id` QQ 号
   * - `nickname` 昵称
   * - `card` 群名片／备注
   * - `sex` 	性别，male 或 female 或 unknown
   * - `age` 年龄
   * - `area` 地区
   * - `join_time` 加群时间戳
   * - `last_sent_time` 最后发言时间戳
   * - `level` 成员等级
   * - `role` 角色，owner 或 admin 或 member
   * - `unfriendly` 是否不良记录成员
   * - `title` 专属头衔
   * - `title_expire_time` 专属头衔过期时间戳
   * - `card_changeable` 是否允许修改群名片
   */
  get_group_member_list: (group_id: number) => Promise<Array<{
    group_id: number,
    user_id: number,
    nickname: string,
    card: string,
    sex: 'male' | 'female' | 'unknown',
    age: number,
    area: string,
    join_time: number,
    last_sent_time: number,
    level: string,
    role: 'owner' | 'admin' | 'member',
    unfriendly: boolean,
    title: string,
    title_expire_time: number,
    card_changeable: boolean
  }>>

  /**
   * 获取群荣誉信息
   * @param group_id 群号
   * @param type 要获取的群荣誉类型 可传入 talkative performer legend strong_newbie emotion 以分别获取单个类型的群荣誉数据，或传入 all 获取所有数据
   * @returns Promise 返回群荣誉信息
   * - `group_id` 群号
   * - `current_talkative` 当前龙王
   * - `talkative_list` 历史龙王
   * - `performer_list` 群聊之火
   * - `legend_list` 群聊炽焰
   * - `strong_newbie_list` 冒尖小春笋
   * - `emotion_list` 快乐之源
   */
  get_group_honor_info: (
    group_id: number,
    type: 'talkative' | 'performer' | 'legend' | 'strong_newbie' | 'emotion' | 'all'
  ) => Promise<{
    group_id: number,
    current_talkative?: {
      user_id: number,
      nickname: string,
      avatar: string,
      day_count: number
    },
    talkative_list?: Array<honerOne>,
    performer_list?: Array<honerOne>,
    legend_list?: Array<honerOne>,
    strong_newbie_list?: Array<honerOne>,
    emotion_list?: Array<honerOne>
  }>

  /**
   * 获取 Cookies
   * @param domain 需要获取 cookies 的域名
   * @returns Promise 返回 cookies
   */
  get_cookies: (domain?: string) => Promise<{
    cookies: string
  }>

  /**
   * 获取 CSRF Token
   * @returns Promise 返回 CSRF Token
   */
  get_csrf_token: () => Promise<{
    token: number  
  }>

  /**
   * 获取 QQ 相关接口凭证
   * @param domain 需要获取 cookies 的域名
   * @returns Promise 返回 cookies 和 CSRF Token
   */
  get_credentials: (domain?: string) => Promise<{
    cookies: string,
    csrf_token: number
  }>

  /**
   * 获取语音
   * @param file 收到的语音文件名
   * @param out_format 要转换到的格式
   * @returns Promise 返回转换后的语音文件路径
   */
  get_record: (file: string, out_format: string) => Promise<{
    file: string
  }>

  /**
   * 获取图片
   * @param file 收到的图片文件名
   * @returns Promise 返回下载后的图片文件路径
   */
  get_image: (file: string) => Promise<{
    file: string  
  }>

  /**
   * 检查是否可以发送图片
   * @returns Promise 返回是否可以发送图片
   */
  can_send_image: () => Promise<{
    yes: boolean
  }>

  /**
   * 检查是否可以发送语音
   * @returns Promise 返回是否可以发送语音
   */
  can_send_record: () => Promise<{
    yes: boolean  
  }>

  /**
   * 获取运行状态
   * @returns Promise 返回当前运行状态
   */
  get_status: () => Promise<Status>

  /**
   * 获取版本信息
   * @returns Promise 返回应用和协议的版本信息
   * - `app_name` 应用标识，如 mirai-native
   * - `app_version` 应用版本，如 1.2.3
   * - `protocol_version` OneBot 标准版本，如 v11
   * - `……` OneBot 实现自行添加的其它内容
   */
  get_version_info: () => Promise<{
    app_name: string,
    app_version: string, 
    protocol_version: string,
    [key: string]: any
  }>

  /**
   * 重启 OneBot 实现
   * @param delay 要延迟的毫秒数，默认为 0
   */
  set_restart: (delay?: number) => Promise<void>

  /**
   * 清理缓存
   */
  clean_cache: () => Promise<void>
}
