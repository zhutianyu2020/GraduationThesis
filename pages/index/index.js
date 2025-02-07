Page({
  navigateToTranslation() {
    wx.navigateTo({
      url: '/pages/translationFunctionModule/index'
    });
  },
  navigateToModuleDiagram() {
    console.log("模块图生成s");
    wx.navigateTo({
      url: '/pages/moduleDiagramModule/index'
    });
  },
  navigateToFlowchart() {
    wx.navigateTo({
      url: '/pages/flowchartModule/index'
    });
  },
  navigateToUseCaseDiagram() {
    wx.navigateTo({
      url: '/pages/useCaseDiagramModule/index'
    });
  }
});