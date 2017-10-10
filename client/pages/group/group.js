// pages/group/group.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOnLoad: true,
    belongToThisGroup: false,
    users: {},
    joinLoading: false,
    groupId: -1,
    isManager: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //get the group info
    var groupId = options.groupId;
    that.setData({
      groupId: groupId
    })
    wx.showLoading({
      title: 'Loading',
      mask: true
    })
    console.log("onLoad", options);

    //check session
    wx.checkSession({
      success: function() {
        console.log("Check session successfully");
        that.getGroupInfo(groupId);
      },
      fail: function() {
        console.log("Check session failed, login again");
        wx.login({
          success: function(res) {
            if(res.code) {
              app.globalData.code = res.code;
              that.getGroupInfo(groupId);
            } else {
              console.log("Fail to get user login status!" + res.errMsg);
            }
          },
          fail: function(res) {
            console.log("Fail to login!" + res.errMsg);
          }
        })
      },
      complete: function() {
        wx.hideLoading();
        that.setData({
          isOnLoad: false
        });
      }
    });
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
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '自定义转发标题',
      path: '/pages/group/group?groupId=' + that.data.groupId,
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

  getGroupInfo: function(groupId) {
    var that = this;
    wx.request({
      url: app.globalData.serverURL + 'group',
      data: {
        code: app.globalData.code,
        groupId: groupId
      },
      success: function(res) {
        if(res.data) {
          console.log("Receiving data from server: ", res.data);
          that.setData({
            belongToThisGroup: res.data.belongToThisGroup,
            users: res.data.users,
            isManager: res.data.isManager
          })
        }
      },
      fail: function (res) {
        console.log("Fail to request the server!");
      }
    })
  },
  leaveGroup: function(){
    var that = this;
    if(that.data.joinLoading == true){
      return;
    }
    that.setData({
      joinLoading: true
    });
    if(that.data.isManager) {
      wx.showModal({
        title: "Notice",
        content: "You are currently a group manager. Do you still want to leave a group?",
        confirmText: "Yes",
        cancelText: "No",
        success: function(res) {
          if(res.confirm) {
            console.log("The user confirm to create a group");
            that.leaveGroupHelper();
          } else if (res.cancel) {
            console.log("The user cancel the operation");
            that.setData({
              joinLoading: false
            });
            return;
          }
        }
      });
    } else {
      that.leaveGroupHelper();
    }
  },
  leaveGroupHelper: function() {
    var that = this;
    wx.checkSession({
      fail: function() {
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
          url: app.globalData.serverURL + 'group/leaveGroup',
          data: {
            code: app.globalData.code,
          },
          success: function (res) {
            if(res){
              if(res.data.success){
                app.globalData.isInGroup = false
                wx.redirectTo({
                  url: '../index/index',
                })
              }
            }
          },
          complete: function(res) {
            that.setData({
              joinLoading: false
            });
          }
        });
      }
    });
  },

  joinGroup: function(event) {
  // var that = this;
  //   if(that.data.joinLoading == true) {
  //     return;
  //   }
  // that.setData({
  //   joinLoading: true
  // });
  // wx.checkSession({
  //  success: function() {
      
  //  }
  // fail: function() {
  //   wx.login({
  //     success: function(res) {
  //      if(res.code) {
  //       app.globalData.code = res.code;
  //     } else {
  //       console.log("Fail to get user login status!" + res.errMsg);
  //     }
  // }
  //       });
  //     },
  //     complete: function () {
  //       wx.request({
  //         url: app.globalData.serverURL + 'joinGroup',
  //         data: {
  //           code: app.globalData.code,
  //           status: event.target.dataset.status,
  //           nickName: app.globalData.userInfo.nickName,
  //           avatarUrl: app.globalData.userInfo.avatarUrl
  //         },
  //         success: function (res) {
  //           if (res.data) {
  //             //get the response of changing the user's status from server
  //             console.log("change the status successfully: ", res.data.status);
  //             that.setData({
  //               isInGroup: res.data.status,
  //               users: res.data.users,
  //               usersNum: res.data.usersNum
  //             });
  //             //add the user into users list
  //           } else {
  //             console.log("fail to change the status");
  //           }
  //         },
  //         complete: function(res) {
  //           that.setData({
  //             joinLoading: false
  //           });
  //         }
  //       });
  //     }
  //   });
    
  }
})

