Page({
  data: {
    inputText: '', // 输入的文本
    translatedText: '', // 翻译后的文本
    sourceLang: 'zh', // 源语言，默认中文
    targetLang: 'en', // 目标语言，默认英文
    access_token: '', // 存储访问令牌
    maxLength: 10000,  // 添加最大字符限制
    currentLength: 0  // 添加当前字符计数
  },

  onLoad: function () {
    this.getToken();
  },

  // 获取访问令牌
  getToken() {
    const url_token = "https://aip.baidubce.com/oauth/2.0/token?client_id=78UFlxMPj1P2gcX05aIuL5hn&client_secret=ZSYSgScTsULQ94zyp5XsvLkBaYg457vR&grant_type=client_credentials";

    wx.request({
      url: url_token,
      method: "POST",
      header: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      success: res => {
        this.setData({
          access_token: res.data.access_token
        });
      },
      fail: err => {
        wx.showToast({
          title: '获取token失败',
          icon: 'none'
        });
      }
    });
  },

  // 处理输入框内容变化
  handleInput(e) {
    const text = e.detail.value;
    const length = text.length;
    
    if (length <= this.data.maxLength) {
      this.setData({
        inputText: text,
        currentLength: length
      });
    } else {
      // 超出限制时截断文本
      this.setData({
        inputText: text.substring(0, this.data.maxLength),
        currentLength: this.data.maxLength
      });
      wx.showToast({
        title: '已达到字数上限',
        icon: 'none'
      });
    }
  },

  // 选择源语言
  selectSourceLang(e) {
    const lang = e.currentTarget.dataset.lang;
    if (lang === this.data.targetLang) {
      this.setData({
        sourceLang: lang,
        targetLang: this.data.sourceLang
      });
    } else {
      this.setData({
        sourceLang: lang
      });
    }
  },

  // 选择目标语言
  selectTargetLang(e) {
    const lang = e.currentTarget.dataset.lang;
    if (lang === this.data.sourceLang) {
      this.setData({
        targetLang: lang,
        sourceLang: this.data.targetLang
      });
    } else {
      this.setData({
        targetLang: lang
      });
    }
  },

  // 执行翻译
  translate() {
    if (!this.data.inputText.trim()) {
      wx.showToast({
        title: '请输入要翻译的文字',
        icon: 'none'
      });
      return;
    }

    if (!this.data.access_token) {
      wx.showToast({
        title: '正在获取授权，请稍后重试',
        icon: 'none'
      });
      this.getToken();
      return;
    }

    wx.showLoading({
      title: '翻译中...'
    });

    const url_chat = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_speed?access_token=${this.data.access_token}`;

    // 构建翻译提示语
    const fromLang = this.data.sourceLang === 'zh' ? '中文' : '英文';
    const toLang = this.data.targetLang === 'zh' ? '中文' : '英文';
    
    const payload = {
      messages: [
        {
          role: "user",
          content: `请将以下${fromLang}翻译成${toLang}，只需要返回翻译结果，不需要解释：\n${this.data.inputText}`
        }
      ]
    };

    wx.request({
      url: url_chat,
      method: "POST",
      data: payload,
      header: {
        'Content-Type': 'application/json'
      },
      success: res => {
        wx.hideLoading();
        if (res.data && res.data.result) {
          this.setData({
            translatedText: res.data.result
          });
        } else {
          wx.showToast({
            title: '翻译失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '翻译请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 保留其他生命周期函数...
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
});