export default {
    state: {
        visitList: [],
        currentVisit: {
            code: ''
        }
    },
    mutations: {
        setVisitList(state, data){
            state.visitList = data
        },
        // data === index
        delVisitListOfIndex(state, data){
            state.visitList.splice(data, 1)
        },
        setCurrentVisit(state, data){
            state.currentVisit = Object.assign({code: ''}, data)
            console.log('setCurrentVisit=====',state.currentVisit.code)
        },
        setVisitListUnRead(state, data){
           let index = state.visitList.findIndex(v=>v.groupId == data.groupId)
        },
        updateCurVisit(state, data){
            state.currentVisit = Object.assign(state.currentVisit, data)
        }
    }
}