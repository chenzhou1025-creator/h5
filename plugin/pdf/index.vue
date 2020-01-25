<template>
  <div id="container" @click.self="closePdf" v-if="pageFlag">
    <!-- <div class='pdf-page'> -->
        
        <div style="width: 100%;height: 100%;">
          <canvas id="the-canvas"></canvas>
        </div>
   
      <div class="foot" v-if='pdfDoc'>
        <button class='left' v-if="pageNum>1" @click.stop="onPrevPage">上一页</button>
        <button class='right' v-if="pageNum<pdfDoc.numPages" @click="onNextPage">下一页</button>
        <img src="../../assets/images/x_03.png" @click="closePdf"/>
      </div>
    <!-- </div> -->
  </div>
</template>
<script>
import PDFJS from 'pdfjs-dist'
import PinchZoom from '../../utils/js/pinchzoom'
export default {
  data () {
    return {
      pdfDoc: null,
      pageNum: 1,
      pageRendering: false,
      pageNumPending: null,
      scale: 0.8,
      pageFlag: true,
    }
  },
  mounted: function () {
     this.listenMql()
  },
  methods: {
    showPDF (url) {
      let _this = this
      this.pageFlag = true
      PDFJS.getDocument(url).then(function (pdf) {
        _this.pdfDoc = pdf
        _this.renderPage(1)
      })
    },
    renderPage (num, scale) {
      this.pageRendering = true
      let _this = this
      this.pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(1.2)
        // _this.scale = scale || (document.body.offsetWidth-20)/viewport1.width
        // var viewport = page.getViewport(_this.scale)
        console.log(page, viewport)
        let canvas = document.getElementById('the-canvas')
        canvas.height = viewport.height
        canvas.width = viewport.width
        var zoom = new PinchZoom(canvas, {
            minZoom: 0.5,
            maxZoom:4
        })
        
        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        }
        var renderTask = page.render(renderContext)
 
        // Wait for rendering to finish
        renderTask.promise.then(function () {
          _this.pageRendering = false
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
      if (this.pageNum >= this.pdfDoc.numPages) {
        return
      }
      this.pageNum++
      this.queueRenderPage(this.pageNum)
    },
    onEnlarge () {
        this.scale+=0.1
        this.renderPage(this.pageNum, this.scale)
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
    }
  }
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
  padding: pxToem(50) pxToem(10);
}
 
.pdf-page {
 
}
 
.foot {
  position: absolute;
  transform: translate(-50%,0);
  right: pxToem(10);
  top: 3%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  *{
     margin-left: pxToem(6);
  }
  img{
    width: pxToem(22);
  }
}
</style>