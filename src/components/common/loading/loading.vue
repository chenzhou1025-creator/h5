
<template>
    <div class="demo-spin-container" v-if='loadings'>
        <Spin fix :class="{noBgColor:NoBg}">
            <Icon type="ios-loading" size=18 class="spin-icon-load"></Icon>
            <div>{{loadText||'加载中'}}</div>
        </Spin>
    </div>
</template>
<script>
export default {
    name: "appLoading", // Do not use built-in or reserved HTML elements as component id
    props: ["isloading", "loadText", "NoBg"],
    data: function() {
        return {
            loadings: false
        }
    },
    watch: {
        isloading(curVal, oldVal) {
            this.loadings = curVal;
        },
        loadText: {// Loading或加载中  默认加载中
            handle(curVal, oldVal) {
                this.loadText = curVal;
            },
        },
        NoBg: {// Loading或加载中  默认加载中
            handle(curVal, oldVal) {
                this.NoBg = curVal;
            },
        },
    }
}

</script>

<style lang="scss">
.spin-icon-load {
    animation: ani-demo-spin 1s linear infinite;
}

.demo-spin-container {
    .noBgColor {
        background-color: transparent;
    }
}

@keyframes ani-demo-spin {
    from {
        transform: rotate(0deg);
    }
    50% {
        transform: rotate(180deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>