// pages/translationFunctionModule/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,     //控制弹出层是否弹出的值
    projectName: '',
    modules: [''],
    canvas: null,
    ctx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    fontFamilies: ['Arial', '宋体', '微软雅黑'],
    fontSizes: [12, 14, 16, 18, 20],
    lineWidths: [1, 2, 3, 4, 5],
    fontFamily: 'Arial',
    fontSize: 14,
    lineWidth: 2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initCanvas()
  },
  showPopup(e) { //点击选择性别，打开弹出层（选择器）
    this.setData({
      show: true
    })
  },
  onClose() { //点击空白处开闭弹出层（选择器）及选择器左上角的取消
    this.setData({
      show: false
    });
  },

  async initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#moduleChart')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 获取设备信息
        const systemInfo = wx.getSystemInfoSync()
        const dpr = systemInfo.pixelRatio
        const screenWidth = systemInfo.windowWidth

        // 设置画布大小为屏幕宽度
        canvas.width = screenWidth * dpr
        canvas.height = 500 * dpr // 固定高度为500px

        // 缩放以适应设备像素比
        ctx.scale(dpr, dpr)

        this.setData({
          canvas,
          ctx,
          canvasWidth: screenWidth,
          canvasHeight: 500
        })
      })
  },

  onProjectNameInput(e) {
    this.setData({
      projectName: e.detail
    })
  },

  onModuleInput(e) {
    const {
      index
    } = e.currentTarget.dataset
    const modules = [...this.data.modules]
    modules[index] = e.detail
    this.setData({
      modules
    })
  },

  addModule() {
    const modules = [...this.data.modules, '']
    this.setData({
      modules
    })
  },

  deleteModule(e) {
    const {
      index
    } = e.currentTarget.dataset
    const modules = this.data.modules.filter((_, i) => i !== index)
    this.setData({
      modules
    })
  },

  onFontFamilyChange(e) {
    this.setData({
      fontFamily: this.data.fontFamilies[e.detail.value]
    })
  },

  onFontSizeChange(e) {
    this.setData({
      fontSize: this.data.fontSizes[e.detail.value]
    })
  },

  onLineWidthChange(e) {
    this.setData({
      lineWidth: this.data.lineWidths[e.detail.value]
    })
  },

  generateChart() {
    const {
      ctx,
      canvas,
      canvasWidth,
      fontFamily,
      fontSize,
      lineWidth
    } = this.data
    const {
      projectName,
      modules
    } = this.data

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 设置字体和线条宽度
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.lineWidth = lineWidth
    ctx.textAlign = 'center'

    // 计算项目名称框的宽度
    const textMetrics = ctx.measureText(projectName)
    const boxWidth = Math.min(textMetrics.width + 20, canvasWidth * 0.8)
    const boxHeight = 40
    const moduleBoxWidth = Math.min(40, canvasWidth * 0.1)
    const moduleBoxHeight = 100
    const moduleGap = Math.min(20, canvasWidth * 0.05)
    const startY = 30

    // 计算所需的总宽度
    const totalModuleWidth = modules.length * (moduleBoxWidth + moduleGap) - moduleGap
    const requiredWidth = Math.max(canvasWidth, totalModuleWidth + 40)

    // 如果需要，调整画布宽度
    if (requiredWidth > this.data.canvasWidth) {
      this.updateCanvasWidth(requiredWidth)
      return
    }

    // 计算起始X位置（画布中心）
    const startX = this.data.canvasWidth / 2

    // 绘制项目名称框
    ctx.strokeRect(startX - boxWidth / 2, startY, boxWidth, boxHeight)
    this.wrapText(ctx, projectName, startX, startY + 25, boxWidth - 10)

    // 计算模块起始X坐标，确保居中
    let currentX = startX - totalModuleWidth / 2 + moduleBoxWidth / 2

    // 绘制主干连接线
    ctx.beginPath()
    ctx.moveTo(startX, startY + boxHeight)
    ctx.lineTo(startX, startY + boxHeight + 20)
    ctx.stroke()

    // 如果有模块，绘制水平连接线
    if (modules.length > 0) {
      ctx.beginPath()
      ctx.moveTo(currentX, startY + boxHeight + 20)
      ctx.lineTo(currentX + totalModuleWidth - moduleBoxWidth, startY + boxHeight + 20)
      ctx.stroke()
    }

    // 绘制每个模块
    modules.forEach((module) => {
      // 垂直连接线
      ctx.beginPath()
      ctx.moveTo(currentX, startY + boxHeight + 20)
      ctx.lineTo(currentX, startY + boxHeight + 40)
      ctx.stroke()

      // 模块框
      ctx.strokeRect(currentX - moduleBoxWidth / 2, startY + boxHeight + 40, moduleBoxWidth, moduleBoxHeight)

      // 模块名称（竖排）
      this.drawVerticalText(ctx, module, currentX, startY + boxHeight + 55, fontSize + 2)

      currentX += moduleBoxWidth + moduleGap
    })

    wx.showToast({
      title: '生成成功',
      icon: 'success'
    })
  },

  // 更新画布宽度的方法
  updateCanvasWidth(newWidth) {
    const query = wx.createSelectorQuery()
    query.select('#moduleChart')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = newWidth * dpr
        canvas.height = this.data.canvasHeight * dpr

        ctx.scale(dpr, dpr)

        this.setData({
          canvas,
          ctx,
          canvasWidth: newWidth
        }, () => {
          this.generateChart() // 重新生成图表
        })
      })
  },

  // 绘制竖排文字
  drawVerticalText(ctx, text, x, y, lineHeight) {
    const chars = text.split('')
    let currentY = y
    chars.forEach(char => {
      ctx.fillText(char, x, currentY)
      currentY += lineHeight
    })
  },

  // 文字自动换行
  wrapText(ctx, text, x, y, maxWidth) {
    const chars = text.split('')
    let line = ''
    let currentY = y

    chars.forEach(char => {
      const testLine = line + char
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth) {
        ctx.fillText(line, x, currentY)
        line = char
        currentY += 20
      } else {
        line = testLine
      }
    })

    ctx.fillText(line, x, currentY)
  },

  // 添加导出图片方法
  exportImage() {
    const {
      canvas
    } = this.data
    if (!canvas) {
      wx.showToast({
        title: '请先生成图表',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '导出中...'
    })

    // 将画布内容转换为图片
    wx.canvasToTempFilePath({
      canvas: canvas,
      success: (res) => {
        // 保存图片到相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading()
            wx.showToast({
              title: '已保存到相册',
              icon: 'success'
            })
          },
          fail: (err) => {
            wx.hideLoading()
            // 如果用户拒绝了授权
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '提示',
                content: '需要您授权保存到相册',
                success: (res) => {
                  if (res.confirm) {
                    // 打开设置页面让用户授权
                    wx.openSetting({
                      success: (settingRes) => {
                        if (settingRes.authSetting['scope.writePhotosAlbum']) {
                          this.exportImage() // 重新尝试保存
                        }
                      }
                    })
                  }
                }
              })
            } else {
              wx.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    })
  }
})