/**
 * Created by chenjianjun on 15/12/8.
 */
var http = require('http');
var env = require("./config");
var Hotel = require("./module/hotel");
var Adv = require("./module/adv");
var Pringles = require("./module/pringles");
var PringlesSeason = require("./module/pringlesSeason");
var Sample = require("./module/sample");
var Suite = require("./module/suite");
var qs = require('querystring');
var r = env.Thinky.r;
var _ = require('lodash')


var models = {
  "Adv": Adv,
  "Hotel": Hotel,
  "Sample": Sample,
  "Pringles": Pringles,
  "PringlesSeason": PringlesSeason,
  "Suite": Suite

}

var dbTool = null;
var mSyncFlg = {
  "Adv": false,
  "Hotel": false,
  "Sample": false,
  "Pringles": false,
  "PringlesSeason": false,
  "Suite": false
};

//查询工具类
function DBUtil() {};

/**
 * 从后台获取数据
 * @param path URL的接口地址如：/api/adv/list?pageIndex=1&pageSize=2
 * @param cb
 * @constructor
 */
function GetData(path, cb) {
  var options = {
    host: env.Config.api_host,
    port: env.Config.api_port,
    path: path,
    method: "GET"
  };



  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    var chunks = "";
    res.on('data', function(chunk) {
      chunks += chunk;
    });
    res.on('end', function() {
      var json = JSON.parse(chunks);
      if (json.code == 200) {
        cb(null, json);
      } else {
        var err = new Error('服务器异常');
        cb(err);
      }
    });
    res.on('error', function(e) {
      cb(e);
    });
  });

  // 设置请求超时15秒
  req.setTimeout(15000);

  req.on('error', function(e) {
    req.res && req.res.abort();
    req.abort();
    var err = new Error('服务器异常');
    cb(err);
  }).on('timeout', function() {
    req.res && req.res.abort();
    req.abort();
    var err = new Error('服务器超时');
    cb(err);
  });

  req.end();
}
/**
 * 同步数据
 * @param module 模块名称
 * @param datas 拉取的数据
 * @param index 分页数
 * @param count 拉取数量
 * @param cb 数据回调
 * @constructor
 */

function SyncFun(module, datas, index, count, cb) {
  var path = env.Config[module + 'Path'] + '?' + qs.stringify({
    pageSize: count,
    pageIndex: index
  });
  GetData(path, function(err, data) {
    if (err) {
      cb(err)
    } else {
      for (var i = 0; i < data.data.length; ++i) {
        datas.push(data.data[i]);
      }

      if (datas.length < data.count) {
        // 如果获取到的数据小于得到的总条数，那么继续拉数据
        SyncFun(module, datas, index + 1, count, cb);
      } else {
        cb(null);
      }
    }
  })
}

/**
 * 同步数据
 * @param type 0:酒店
 * @constructor
 */
function Sync(type) {
  var datas = [];
  SyncFun(type, datas, 1, 10, function(err) {
    if (err) {
      console.log('拉取数据失败.', err);
    } else {
      mSyncFlg[type] = false;
      models[type].delete().run().then(function(rel) {
        models[type].save(datas).then(function(result, error) {
          if (!error) {
            mSyncFlg[type] = true;
          }
        });
      });
    }

  });
}

DBUtil.prototype.isCacheDataUsable = function(moduleName) {
  console.log('modelName:',moduleName);
  return mSyncFlg[moduleName];
};

exports.Instance = function() {
  var tasks = ['Adv', 'Hotel', 'Sample', 'Pringles', 'PringlesSeason', 'Suite'];
  if (dbTool == null) {
    dbTool = new DBUtil();
    // 程序启动取一次数据
    _.each(tasks, function(v) {
        Sync(v)
      })
      // 定时器，根据配置时间拉取
    setInterval(function() {
      _.each(tasks, function(v) {
        Sync(v)
      })
    }, env.Config.cache_time_check);
  }
  return dbTool;
};