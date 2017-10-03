//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
  },
  getUserInfo: function (cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res) {
          var code = res.code;
          if (code) {
            that.globalData.code = code;
            console.log('获取用户登录凭证：' + that.globalData.code);
            //send the code to server
            wx.request({
              url: that.globalData.serverURL + 'onlogin',
              data: { code: code },
              success: function (res) {
                if(res.data) {
                  //get the user's status in the group
                  that.globalData.isInGroup = res.data.isInGroup;
                  that.globalData.users = res.data.users;
                  that.globalData.usersNum = res.data.usersNum;
                  console.log("isInGroup: ", that.globalData.isInGroup);
                } else {
                  console.log("error in found user's status in server");
                }
              }
            });
          } else {
            console.log('获取用户登录态失败：' + res.errMsg);
          }
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },
  globalData: {
    serverURL: 'http://localhost:3000/',
    userInfo: null,
    isInGroup: false,
    code: "",
    users: {},
    usersNum: 0,
  }
})