
<template>
<div>
    <div class='txt-p'>{{text}}</div>
    <img class="photo-p" src='@/assets/images/bg_no_result.png' />
</div>
</template>
<script>
export default {
    name: 'noFound',
    props:{
        text:{
            default: '暂无记录'
        }
    }
}
</script>
<style lang="scss" scoped>
@import './no-found.scss'
</style>