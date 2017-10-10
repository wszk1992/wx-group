// pages/index/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    createLoading: false,
    backLoading: false,
    isInGroup: app.globalData.isInGroup
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
  onShareAppMessage: function () {
  
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

  createGroup: function () {
    var that = this;
    if(that.data.createLoading == true) {
      return;
    }
    that.setData({
      createLoading: true
    });
    //check if the user is currently in a group
    //pop out a modal if true
    if(app.globalData.isInGroup) {
      wx.showModal({
        title: "Notice",
        content: "You are currently in a group. Do you still want to create a group? (leave the current group) ",
        confirmText: "Continue",
        cancelText: "Cancel",
        success: function(res) {
          if(res.confirm) {
            console.log("The user confirm to create a group");
          } else if (res.cancel) {
            console.log("The user cancel the operation");
            return;
          }
        }
      });
    }
    wx.checkSession({
      success: function() {
        that.requestCreateGroup(app.globalData.code);
      },
      fail: function() {
        wx.login({
          success: function(res) {
            if(res.code) {
              app.globalData.code = res.code;
              that.requestCreateGroup(res.code);
            } else {
              console.log("Fail to get user login status!" + res.errMsg);
            }
          },
          fail: function(res) {
            console.log("Fail to login!" + res.errMsg);
          }
        })
      }
    })
  },

  requestCreateGroup: function (code) {
    if(code == null) {
      console.log("Fail to get the code!");
      return;
    }
    wx.request({
      url: app.globalData.serverURL + 'createGroup',
      data: {
        code: code,
        nickName: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl
      },
      success: function (res) {
        if (res.data) {
          console.log("Received data from server: ", res.data);
          app.globalData.groupId = res.data.groupId,
          app.globalData.isInGroup = true
          wx.redirectTo({
            url: "../group/group?groupId=" + app.globalData.groupId,
            success: function(res) {
              console.log("Redirect to /group");
            },
            fail: function(res) {
              console.log("Fail to redirect to /group");
            }
          });
        } else {
          console.log("Received empty data!");
        }
      }
    });
  },

  backToGroup: function () {
    var that = this;
    if(that.data.backLoading == true) {
      return;
    }
    if(!that.data.isInGroup) {
      console.log("The user is not in any group");
      return;
    }
    that.setData({
      backLoading: true
    });
    wx.redirectTo({
      url: "../group/group?groupId=" + app.globalData.groupId,
      success: function(res) {
        console.log("Redirect to /group?groupId=" + app.globalData.groupId);
      },
      fail: function(res) {
        console.log("Fail to redirect to /group");
      }
    });
  }

})