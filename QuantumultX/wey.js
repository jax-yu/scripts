/**
 * wey 脚本
 * 兼容性： 只兼容quanx
 * 1. 自动获取 weySignTokenKey
 * 2. 自动签到获取积分
 * 
 * 开发文档: https://github.com/crossutility/Quantumult-X/blob/master/sample.conf
 * 
*************************
【 QX 1.0.10+ 脚本配置 】 :
*************************

[task_local]
# wey 自动签到
5 0 * * * https://raw.githubusercontent.com/xajeyu/scripts/main/QuantumultX/wey.js, tag=wey派签到, img-url=https://res.gwm.com.cn/weysite/static/src/img/logo-2021-07-20.png, enabled=true

[rewrite_local]
# 重写规则捕捉token
^https://gw-app.beantechyun\.com/app-api/api/v1.0/userAuth/refreshToken url script-response-body https://raw.githubusercontent.com/xajeyu/scripts/main/QuantumultX/wey.js

[mitm]
hostname = *.beantechyun.com
 */

var $env = getEnv();
var weySignTokenKey = "weyAccessToken";
const notifyTitle = "魏派App签到";
const timeout = 15000; //超时时间(单位毫秒)

// 获取本地变量
const TG_API_HOST = $env.read('TG_API_HOST');
const TG_BOT_TOKEN = $env.read('TG_BOT_TOKEN');
const TG_USER_ID = $env.read('TG_USER_ID');

const beanId = $env.read('wey_beanId');
const cVer = $env.read('wey_cVer');

async function sign(token) {
  console.log("wey.js 开始签到：");
  return new Promise((resolve) => {
    $env.post(
      {
        url: "https://wey-restructure-h5.beantechyun.com/app-getway/app-api/api/v1.0/point/sign",
        headers: {
          Host: "wey-restructure-h5.beantechyun.com",
          appId: "2",
          'beanId': beanId,
          "Cache-Control": "no-cache",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 /sa-sdk-ios fromappios wey",
          Referer: "https://wey-restructure-h5.beantechyun.com/",
          brand: "2",
          Pragma: "no-cache",
          'cVer': cVer,
          platformCode: "2",
          Origin: "https://wey-restructure-h5.beantechyun.com",
          accessToken: token,
          rs: "2",
          terminal: "GW_APP_WEY",
          "If-Modified-Since": "0",
          "Accept-Language": "zh-cn",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json;charset=utf-8",
          enterpriseId: "CC01",
        },
        body: '{"port":"WJ0005"}',
      },
      (error, response, data) => {
        console.log(data);
        const res = JSON.parse(data);
        try {
          if (error) throw new Error(error);
          if (res.code === "000000") {
            resolve({
              err: false,
              msg: res.data.pointResultMessage
            });
          } else {
            resolve({
              err: true,
              msg: res
            });
          }
        } catch {
          resolve({
            err: true,
            msg: '签到错误!'
          });
        }
      }
    );
  });
}

async function querySignWeekCalender(token) {
  console.log("wey.js 查询连续签到天数：");
  return new Promise((resolve) => {
    $env.get(
      {
        url: "https://wey-restructure-h5.beantechyun.com/app-getway/app-api/api/v1.0/point/querySignWeekCalender",
        headers: {
          Host: "wey-restructure-h5.beantechyun.com",
          appId: "2",
          'beanId': beanId,
          "Cache-Control": "no-cache",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 /sa-sdk-ios fromappios wey",
          Referer: "https://wey-restructure-h5.beantechyun.com/",
          brand: "2",
          Pragma: "no-cache",
          'cVer': cVer,
          platformCode: "2",
          Origin: "https://wey-restructure-h5.beantechyun.com",
          accessToken: token,
          rs: "2",
          terminal: "GW_APP_WEY",
          "If-Modified-Since": "0",
          "Accept-Language": "zh-cn",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json;charset=utf-8",
          enterpriseId: "CC01",
        }
      },
      (error, response, data) => {
        console.log(data);
        const res = JSON.parse(data);
        try {
          if (error) throw new Error(error);
          resolve(`${res.data.continueSignDays}天`);
        } catch {
          resolve('查询连续签到天数失败!');
        }
      }
    );
  });
}

// 手动签到一次获取 token
function GetToken() {
  const req = $request;
  if (
    req.url ===
    "https://gw-app.beantechyun.com/app-api/api/v1.0/userAuth/refreshToken"
  ) {
    const res = JSON.parse($response.body);
    $env.write(res.data.accessToken, weySignTokenKey);
    $env.notify("wey token获取成功✨", "", JSON.stringify(res.data));
  }
}

(async function main() {
  if (!beanId || !cVer) {
    $env.notify(notifyTitle, "", '所需变量未定义, 请初始化变量!');
    return
  }
  const weyToken = $env.read(weySignTokenKey);
  console.log("wey.js 开始执行...");
  if ($env.isRequest) {
    GetToken();
  } else if (weyToken) {
    const res = await Promise.all([sign(weyToken), querySignWeekCalender(weyToken)])
    $env.tgBotNotify(`wey 自动签到${res[0].err ? '失败' : '成功'}`, `签到结果: ${res[0].msg}\n已连续签到: ${res[1]}`);
    $env.notify(`wey 自动签到${res[0].err ? '失败' : '成功'}`, "", `签到结果: ${res[0].msg}\n已连续签到: ${res[1]}`);
    // $env.tgBotNotify(notifyTitle, '呼啦呼啦');
  }
})()
  .catch((e) => {
    $env.notify("wey签到失败", "", e.message || JSON.stringify(e));
  })
  .finally(() => {
    $env.done();
  });

function getEnv() {
  const start = Date.now();
  const isRequest = typeof $request != "undefined";
  const isSurge = typeof $httpClient != "undefined";
  const isQuanX = typeof $task != "undefined";
  const isLoon = typeof $loon != "undefined";
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined";
  const isNode = typeof require == "function" && !isJSBox;
  const NodeSet = "CookieSet.json";
  const node = (() => {
    if (isNode) {
      const request = require("request");
      const fs = require("fs");
      const path = require("path");
      return {
        request,
        fs,
        path,
      };
    } else {
      return null;
    }
  })();

  const notify = (title, subtitle, message, rawopts) => {
    const Opts = (rawopts) => {
      //Modified from https://github.com/chavyleung/scripts/blob/master/Env.js
      if (!rawopts) return rawopts;
      if (typeof rawopts === "string") {
        if (isLoon) return rawopts;
        else if (isQuanX)
          return {
            "open-url": rawopts,
          };
        else if (isSurge)
          return {
            url: rawopts,
          };
        else return undefined;
      } else if (typeof rawopts === "object") {
        if (isLoon) {
          let openUrl = rawopts.openUrl || rawopts.url || rawopts["open-url"];
          let mediaUrl = rawopts.mediaUrl || rawopts["media-url"];
          return {
            openUrl,
            mediaUrl,
          };
        } else if (isQuanX) {
          let openUrl = rawopts["open-url"] || rawopts.url || rawopts.openUrl;
          let mediaUrl = rawopts["media-url"] || rawopts.mediaUrl;
          return {
            "open-url": openUrl,
            "media-url": mediaUrl,
          };
        } else if (isSurge) {
          let openUrl = rawopts.url || rawopts.openUrl || rawopts["open-url"];
          return {
            url: openUrl,
          };
        }
      } else {
        return undefined;
      }
    };
    console.log(`${title}\n${subtitle}\n${message}`);
    if (isQuanX) $notify(title, subtitle, message, Opts(rawopts));
    if (isSurge) $notification.post(title, subtitle, message, Opts(rawopts));
    if (isJSBox)
      $push.schedule({
        title: title,
        body: subtitle ? subtitle + "\n" + message : message,
      });
  };
  const write = (value, key) => {
    console.log("开始写入token: \n" + "value: \n" + value + "key: \n" + key);
    console.log("是否为quanx" + isQuanX);
    if (isQuanX) return $prefs.setValueForKey(value, key);
    if (isSurge) return $persistentStore.write(value, key);
    if (isNode) {
      try {
        if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet)))
          node.fs.writeFileSync(
            node.path.resolve(__dirname, NodeSet),
            JSON.stringify({})
          );
        const dataValue = JSON.parse(
          node.fs.readFileSync(node.path.resolve(__dirname, NodeSet))
        );
        if (value) dataValue[key] = value;
        if (!value) delete dataValue[key];
        return node.fs.writeFileSync(
          node.path.resolve(__dirname, NodeSet),
          JSON.stringify(dataValue)
        );
      } catch (er) {
        return AnError("Node.js持久化写入", null, er);
      }
    }
    if (isJSBox) {
      if (!value) return $file.delete(`shared://${key}.txt`);
      return $file.write({
        data: $data({
          string: value,
        }),
        path: `shared://${key}.txt`,
      });
    }
  };

  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, response, response.body)
      }, reason => callback(reason.error, null, null))
    }
  }

  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key);
    if (isSurge) return $persistentStore.read(key);
    if (isNode) {
      try {
        if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet)))
          return null;
        const dataValue = JSON.parse(
          node.fs.readFileSync(node.path.resolve(__dirname, NodeSet))
        );
        return dataValue[key];
      } catch (er) {
        return AnError("Node.js持久化读取", null, er);
      }
    }
    if (isJSBox) {
      if (!$file.exists(`shared://${key}.txt`)) return null;
      return $file.read(`shared://${key}.txt`).string;
    }
  };

  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string")
        options = {
          url: options,
        };
      options["method"] = "POST";
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(
        (response) => {
          console.log(response);
          callback(null, response, response.body);
        },
        (reason) => callback(reason.error, null, null)
      );
    }
  };
  const AnError = (name, keyname, er, resp, body) => {
    if (typeof merge != "undefined" && keyname) {
      if (!merge[keyname].notify) {
        merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`;
      } else {
        merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`;
      }
      merge[keyname].error = 1;
    }
    return console.log(
      `\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${
        JSON.stringify(er).match(/\"line\"/)
          ? `\n‼️行列: ${JSON.stringify(er)}`
          : ``
      }${resp && resp.status ? `\n‼️状态: ${resp.status}` : ``}${
        body ? `\n‼️响应: ${resp && resp.status != 503 ? body : `Omit.`}` : ``
      }`
    );
  };

  const tgBotNotify = (title, desp) => {
    const options = {
      url: `https://${TG_API_HOST}/bot${TG_BOT_TOKEN}/sendMessage`,
      body: `chat_id=${TG_USER_ID}&text=${title}\n\n${desp}&disable_web_page_preview=true`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout,
    };
    $env.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log("telegram发送通知消息失败！！\n");
          console.log(err);
        } else {
          data = JSON.parse(data);
          if (data.ok) {
            console.log("Telegram发送通知消息成功🎉。\n");
          } else if (data.error_code === 400) {
            console.log("请主动给bot发送一条消息并检查接收用户ID是否正确。\n");
          } else if (data.error_code === 401) {
            console.log("Telegram bot token 填写错误。\n");
          }
        }
      } catch (e) {
        $env.notify(e, resp);
      } finally {
        resolve(data);
      }
    });
  };

  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2);
    return console.log("\n签到用时: " + end + " 秒");
  };

  const done = (value = {}) => {
    if (isQuanX) return $done(value);
  };
  return {
    AnError,
    isRequest,
    isQuanX,
    get,
    notify,
    write,
    read,
    tgBotNotify,
    post,
    time,
    done,
  };
}
