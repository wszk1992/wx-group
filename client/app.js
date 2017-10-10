//app.js
App({
  onLaunch: function () {
    var that = this;
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    //调用登录接口
    wx.login({
      success: function (res) {
        var code = res.code;
        if (code) {
          that.globalData.code = code;
          console.log('Received login code: ' + that.globalData.code);
          //send the code to server
          wx.request({
            url: that.globalData.serverURL + 'onlogin',
            data: { code: code },
            success: function (res) {
              if(res.data) {
                //get the user's status in the group
                console.log("Received data from server: ", res.data);
                that.globalData.isInGroup = res.data.isInGroup;
                that.globalData.groupId = res.data.groupId;
              } else {
                console.log("error in found user's status in server");
              }
            }, 
            fail: function (res) {
              console.log("failed to get request!");
            }
          });
        } else {
          console.log('Getting user login status failed' + res.errMsg);
        }
        wx.getUserInfo({
          success: function (res) {
            that.globalData.userInfo = res.userInfo;
          },
          fail: function (res) {
            console.log('Getting userInfo failed' + res.errMsg);
          }
        })
      }
    });
  },
  // getUserInfo: function (cb) {
  //   var that = this;
  //   if (that.globalData.userInfo) {
  //     typeof cb == "function" && cb(that.globalData.userInfo)
  //   } else {
      
  //   }
  // },
  globalData: {
    userInfo: {},
    serverURL: 'https://salty-tundra-57785.herokuapp.com/',
    isInGroup: false,
    groupId: -1,
    code: "",
    users: {},
    usersNum: 0,
  }
})

