<template>
  <div id="container" v-if="pageFlag">
    <!-- <div class='pdf-page'> -->
        
        <div  v-if="pdfDoc" style="width: 100%;height: auto;" id="canvas-container">
            <div v-for="v in pdfDoc.numPages" :key=v :class="'canvas' + v">
                <canvas :id="'the-canvas' + v"  ></canvas>
            </div>
        </div>
   
      <div class="foot" v-if='pdfDoc'>
        <span>{{viewPageNum >= pdfDoc.numPages ? pdfDoc.numPages: viewPageNum}}/{{pdfDoc.numPages}}</span>
        <img src="../../assets/images/x_03.png" @click="closePdf"/>
      </div>
    <!-- </div> -->
  </div>
</template>
<script>
/* eslint-disable no-new */
import PDFJS from 'pdfjs-dist'
import PinchZoom from '../../utils/js/pinchzoom'
import store from '../../store'
import { publicApi } from "../../utils/js/env.js"
const downloadFilePre = `/sysfile-oss/sysFile/downloadFile?url=`
export default {
  data () {
    return {
      pdfDoc: null,
      pageNum: 1,
      pageRendering: false,
      pageNumPending: null,
      scale: 0.8,
      pageFlag: true,
      zoom: {
        offset: {x: 0, y: 0}
      }, // 监控滚动高度
      viewPageNum:1
    }
  },
  mounted: function () {
    //  this.listenMql()
    //  console.log(this)
  },
  methods: {
    showPDF (url) {
      let _this = this
      this.pageFlag = true
      this.pageNum =1
      store.commit('updateLoadingStatus', {isLoading: true})
      console.log(publicApi + downloadFilePre + url)
      PDFJS.getDocument(url).then(function (pdf) {
        _this.pdfDoc = pdf
        console.log(_this.pdfDoc)
        _this.renderPage(1)
    
      })
    },
    renderPage (num) {
      this.pageRendering = true
      let _this = this
      this.pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(2.5)
        // console.log(page, viewport)
        let canvas = document.getElementById('the-canvas' + num)
        let scale1 = document.body.offsetWidth/viewport.width
        canvas.height = viewport.height
        canvas.width = viewport.width
        canvas.style.transform = 'scale(' + scale1 + ')'
        canvas.style.display = 'block'
        let canvasNum = document.querySelector('.canvas' + num)
        canvasNum.style.height = canvasNum.offsetWidth / (viewport.viewBox[2]/viewport.viewBox[3]) + 'px'
        // canvasNum.style.height = (viewport.height * window.screen.width/750 + 20) + 'px'
        // console.dir(canvasNum)
           
        
        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        }
        var renderTask = page.render(renderContext)
 
        // Wait for rendering to finish
        renderTask.promise.then(function () {
          _this.pageRendering = false
           _this.onNextPage()
          if (_this.pageNumPending !== null) {
            // New page rendering is pending
            this.renderPage(_this.pageNumPending)
            _this.pageNumPending = null
          }
        })
      })
    },
    queueRenderPage (num) {
      if (this.pageRendering) {
        this.pageNumPending = num
      } else {
        this.renderPage(num)
      }
    },
    onPrevPage () {
      if (this.pageNum <= 1) {
        return
      }
      this.pageNum--
      this.queueRenderPage(this.pageNum)
    },
    onNextPage () {
        console.log('下一页', (this.pageNum >= this.pdfDoc.numPages))
        //  所有页数渲染完成初始化 PinchZoom 
      if (this.pageNum >= this.pdfDoc.numPages) {
        this.initPinchZoom()
        return
      }
      this.pageNum++
      this.queueRenderPage(this.pageNum)
    },
    closePdf () {
        this.pageFlag = false
    },
    listenMql (){
      var mql = null
      var _this = this
      mql = window.matchMedia('(orientation: portrait)');
        console.log(mql);
        function handleOrientationChange(mql) {
          if(mql.matches) {
           console.log('portrait'); // 打印竖屏
           _this.renderPage(_this.pageNum)
          }else {
            _this.renderPage(_this.pageNum)
            console.log('landscape'); // 打印横屏
         }
       }
        // 打印日志
             handleOrientationChange(mql);
          // 监听屏幕模式的变化
            mql.addListener(handleOrientationChange);
    },
    isWeChat(){
      let ua = '' + window.navigator.userAgent.toLowerCase()
      return /MicroMessenger/i.test(ua)
    },
    initPinchZoom(){
        let canvasContainer = document.getElementById('canvas-container')
        this.zoom = null
        var weChatbar = this.isWeChat() ? 120 * window.screen.width/750 : 0
        var zoomer = canvasContainer.offsetHeight/(window.screen.height - weChatbar)
        console.log(zoomer)
         this.zoom = new PinchZoom(canvasContainer, {
            draggable: true,
            minZoom: zoomer > 1 ? 1 : zoomer/2,
            maxZoom:canvasContainer.offsetHeight/window.screen.height * 4,
            zoomFactor: zoomer,
            defaultZoomFactor: zoomer,
            tapZoomFactor: zoomer
        })
        console.log('---------------------')
        console.dir(canvasContainer, window.screen.width)
        
        this.zoom.offset = {x: 0, y: 0}
        this.zoom.initialOffset = {x: 0, y: 0}
        this.zoom.zoomFactor = zoomer
        console.dir( this.zoom)
        store.commit('updateLoadingStatus', {isLoading: false})
    }
  },
  watch: {
    'zoom.offset.y': function(newVal, oldVal){
      var h = document.querySelector('.canvas1').offsetHeight || 505
      // console.log(document.querySelector('.canvas1').offsetHeight, h, this.zoom.offset.y/h)
      this.viewPageNum = Math.ceil(this.zoom.offset.y/h) || 1
      
    }
  },
}
</script>
 
<style lang="scss" scoped>
#container {
  background-color: rgba(0,0,0,0.75);
  position:fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  text-align: center;
//   padding: pxToem(50) pxToem(10);
}
 
.pdf-page {
 
}
 
.foot {
  position: absolute;
  right: pxToem(10);
  left: pxToem(10);
  top: 3%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  img{
    width: pxToem(22);
  }
}
#canvas-container{
  min-height: 100%;
  transition: all 0.5s ease;
    >div{
        canvas{
            transform-origin: top left;
        }
    }
}
</style>