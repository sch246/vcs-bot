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
    send_private_msg: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_private_msg", {...args})
    },
    send_group_msg: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_group_msg", {...args})
    },
    send_msg: async function (message, params) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_msg", {message, ...params})
    },
    delete_msg: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("delete_msg", {...args})
    },
    get_msg: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_msg", {...args})
    },
    get_forward_msg: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_forward_msg", {...args})
    },
    send_like: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("send_like", {...args})
    },
    set_group_kick: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_kick", {...args})
    },
    set_group_ban: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_ban", {...args})
    },
    set_group_anonymous_ban: async function (group_id, params) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_anonymous_ban", {group_id, ...params})
    },
    set_group_whole_ban: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_whole_ban", {...args})
    },
    set_group_admin: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_admin", {...args})
    },
    set_group_anonymous: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_anonymous", {...args})
    },
    set_group_card: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_card", {...args})
    },
    set_group_name: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_name", {...args})
    },
    set_group_leave: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_leave", {...args})
    },
    set_group_special_title: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_special_title", {...args})
    },
    set_friend_add_request: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_friend_add_request", {...args})
    },
    set_group_add_request: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("set_group_add_request", {...args})
    },
    get_login_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_login_info", {...args})
    },
    get_stranger_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_stranger_info", {...args})
    },
    get_friend_list: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_friend_list", {...args})
    },
    get_group_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_info", {...args})
    },
    get_group_list: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_list", {...args})
    },
    get_group_member_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_member_info", {...args})
    },
    get_group_member_list: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_member_list", {...args})
    },
    get_group_honor_info: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_group_honor_info", {...args})
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
    get_record: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_record", {...args})
    },
    get_image: async function (...args) {
      const http = core.get<IHTTP>('http');
      return await http.call("get_image", {...args})
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
