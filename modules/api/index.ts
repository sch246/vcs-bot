// modules/api/index.ts

import { ICore } from '../../core/types';
import { IHTTP } from '../http/types';
import { IAPI } from './types';

export function init(core: ICore): IAPI {
  return {
    load: async function() {
      await core.load("http")
      console.log('Module "api" loaded');
    },
    unload: async function() {
      console.log('Module "api" unloaded');
    },
    send_private_msg: async function (message, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_private_msg", {message, user_id, ...args})
    },
    send_group_msg: async function (message, group_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_group_msg", {message, group_id, ...args})
    },
    send_msg: async function (message, params) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_msg", {message, ...params})
    },
    delete_msg: async function (message_id) {
      const http = core.get<IHTTP>('http');
      return await http.call("delete_msg", {message_id})
    },
    get_msg: async function (message_id) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_msg", {message_id})
    },
    get_forward_msg: async function (id) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_forward_msg", {id})
    },
    send_like: async function (user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_like", {user_id, ...args})
    },
    set_group_kick: async function (group_id, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_kick", {group_id, user_id, ...args})
    },
    set_group_ban: async function (group_id, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_ban", {group_id, user_id, ...args})
    },
    set_group_anonymous_ban: async function (group_id, params) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_anonymous_ban", {group_id, ...params})
    },
    set_group_whole_ban: async function (group_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_whole_ban", {group_id, ...args})
    },
    set_group_admin: async function (group_id, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_admin", {group_id, user_id, ...args})
    },
    set_group_anonymous: async function (group_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_anonymous", {group_id, ...args})
    },
    set_group_card: async function (group_id, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_card", {group_id, user_id, ...args})
    },
    set_group_name: async function (group_id, group_name) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_name", {group_id, group_name})
    },
    set_group_leave: async function (group_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_leave", {group_id, ...args})
    },
    set_group_special_title: async function (group_id, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_special_title", {group_id, user_id, ...args})
    },
    set_friend_add_request: async function (flag, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_friend_add_request", {flag, ...args})
    },
    set_group_add_request: async function (flag, sub_type, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_add_request", {flag, sub_type, ...args})
    },
    get_login_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_login_info", {...args})
    },
    get_stranger_info: async function (user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_stranger_info", {user_id, ...args})
    },
    get_friend_list: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_friend_list", {...args})
    },
    get_group_info: async function (group_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_info", {group_id, ...args})
    },
    get_group_list: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_list", {...args})
    },
    get_group_member_info: async function (group_id, user_id, ...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_member_info", {group_id, user_id, ...args})
    },
    get_group_member_list: async function (group_id) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_member_list", {group_id})
    },
    get_group_honor_info: async function (group_id, type) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_honor_info", {group_id, type})
    },
    get_cookies: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_cookies", {...args})
    },
    get_csrf_token: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_csrf_token", {...args})
    },
    get_credentials: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_credentials", {...args})
    },
    get_record: async function (file, out_format) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_record", {file, out_format})
    },
    get_image: async function (file) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_image", {file})
    },
    can_send_image: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("can_send_image", {...args})
    },
    can_send_record: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("can_send_record", {...args})
    },
    get_status: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_status", {...args})
    },
    get_version_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_version_info", {...args})
    },
    set_restart: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_restart", {...args})
    },
    clean_cache: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("clean_cache", {...args})
    },
  };
};
