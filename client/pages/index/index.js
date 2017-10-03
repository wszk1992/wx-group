// pages/index/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isInGroup: false,
    serverURL: 'http://localhost:3000/',
    users: {},
    usersNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
    var that = this;
    if (app.globalData.userInfo) {
      that.setData({
        isInGroup: app.globalData.isInGroup,
        users: app.globalData.users,
        usersNum: app.globalData.usersNum
      })
    } else {
      app.getUserInfo(function (userInfo) {
        //更新数据
        that.setData({
          isInGroup: app.globalData.isInGroup,
          users: app.globalData.users,
          usersNum: app.globalData.usersNum
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '自定义转发标题',
      path: '/',
      success: function (res) {
        // 转发成功
        console.log("share successfully");
      },
      fail: function (res) {
        // 转发失败
        console.log("share failed");
      }
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  joinGroup: function(event) {
    console.log('current status: ', event.target);
    //join the user into the group
    var that = this;
    wx.checkSession({
      fail: function () {
        wx.login({
          success: function(res) {
            if(res.code) {
              app.globalData.code = res.code;
            } else {
              console.log("Fail to get user login status!" + res.errMsg);
            }
          }
        });
      },
      complete: function () {
        wx.request({
          url: that.data.serverURL + 'joinGroup',
          data: {
            code: app.globalData.code,
            status: event.target.dataset.status,
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl
          },
          success: function (res) {
            if (res.data) {
              //get the response of changing the user's status from server
              console.log("change the status successfully: ", res.data.status);
              that.setData({
                isInGroup: res.data.status,
                users: res.data.users,
                usersNum: res.data.usersNum
              });
              //add the user into users list
            } else {
              console.log("fail to change the status");
            }
            console.log("current status: ",that.data.isInGroup);
          }
        });
      }
    });
    
  }
})

