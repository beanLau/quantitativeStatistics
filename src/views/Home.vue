<template>
  <div>
    <!-- <courseware-player :defaultUrl="defaultUrl" ref="coursewarePlayer" :width="width" :height="height" style="background-color: transparent"> </courseware-player> -->
    <chartK style="width:400px;height:200px;"></chartK>
  </div>
</template>

<script>
import chartK from "../components/chart-k.vue"
import request from "../utils/request";
import indicator from "../utils/indicator";
import moment from "moment";
import allCode from "../all.js"
//import CoursewarePlayer from "iteach-courseware-player";
let allCodeList = [allCode[0]]
export default {
  name: "Home",
  components: {
    chartK
  },
  data() {
    return {
      list: [],
      codeList: [],
      defaultUrl: 'https://iteachcdn.xdf.cn/mmcw/game/display.html?source=icreate&refer=01&jsonUrl=https://iteachcdn.xdf.cn/other/702e80b0af744fcc95cee2b9548db927.json&paramCfg=https://iteachcdn.xdf.cn/customFile/251ede8ad4a64ea78720f796c6ed571b.json&gameTemplateType=33',
      width: 1080,
      height: 688
    };
  },
  mounted() {
    //this.init();
  },
  methods: {
    async init() {
    },
    async getData(list, typeName){
      list = list || allCode || []
      for(let i = 0;i<list.length;i++){
        let item = list[i]
        if(item.children){
          await this.getData(item.children,(typeName ? typeName + '-' : '') + item.name)
        }else{
          let arr = item.id.split('.')
          arr[1] = arr[1].toLocaleLowerCase();
          let code = arr.reverse().join('')
          let weekList = await this.getWeekData(code);
          if (weekList && this.computeIsMinRSI(weekList.rsi)) {
            let item = {
              typeName: typeName,
              code: code,
              weekKDJ: true,
              dayKDJ: true,
              price: 0
            }
            this.list.push(item);
          }
        }
      }
      
    },
    async findKdjData(list) {
      
      // let index = 0;
      // let length = this.codeList.length;
      // let timer = setInterval(async () => {
      //   let currentIndex = index % length;
      //   let code = this.codeList[currentIndex];
      //   let weekList = await this.getWeekData(code);
      //   if (weekList && this.computeIsMinRSI(weekList.rsi)) {
      //     let dayList = await this.getDayData(code);
      //     if (!dayList) {
      //       index++;
      //       return;
      //     }
      //     let list = dayList.list;
      //     if (list) {
      //       let item = {
      //         code: code,
      //         weekKDJ: true,
      //         dayKDJ: true,
      //         price: list[list.length - 1][2],
      //       };
      //       if (dayList && this.computeIsMinRSI(dayList.rsi)) {
      //         item.dayKDJ = true;
      //       } else if (dayList) {
      //         item.dayKDJ = false;
      //       }
      //       let mothList = await this.getMonthData(code);
      //       if (mothList && this.computeIsMinRSI(mothList.rsi)) {
      //         item.monthKDJ = true;
      //       } else if (mothList) {
      //         item.monthKDJ = false;
      //       }
      //       this.list.push(item);
      //     }
      //   }
      //   index++;
      // }, 200);
    },
    computeIs2KDJ(list) {
      let k = list.k;
      let d = list.d;
      let j = list.j;
      let length = k.length;
      if (j[length - 1] > 30) {
        return false;
      }
      let allList = k.map((k, index) => {
        return [k, d[index], j[index]];
      });
      let hasOneKDJ =
        allList.filter((item) => {
          return item[2] > item[0];
        }).length == 1;
      let willKDJ =
        Math.abs(j[length - 1] - k[length - 1]) <= 5 &&
        j[length - 1] < k[length - 1] &&
        Math.abs(j[length - 2] - k[length - 2]) >
          Math.abs(j[length - 1] - k[length - 1]) &&
        j[length - 2] < k[length - 2];

      return willKDJ && hasOneKDJ;
    },

    computeIsMinRSI(list) {
      let rsi6 = list.rsi6;
      let length = rsi6.length;
      // if (rsi6[length - 1] > 30) {
      //   return false;
      // }
      let firstValue = rsi6[0]
      while(firstValue == 0){
        firstValue = rsi6.shift()
      }
      if(rsi6.length > 30){
        rsi6 = rsi6.slice(rsi6.length - 30)
      }
      let isMin = true;
      let minPrice = Math.min(...rsi6);
      let lastPrice = rsi6[rsi6.length - 1]
      for(let i=0;i<rsi6.length - 1;i++){
        if(rsi6[i] < lastPrice){
          isMin = false
        }
      }
      return isMin || Math.abs(minPrice - lastPrice) < 1
    },
    computeIsKDJ(list) {
      let k = list.k;
      let d = list.d;
      let j = list.j;
      let length = k.length;
      if (j[length - 1] > 30) {
        return false;
      }
      if (j[length - 1] > k[length - 1] && j[length - 2] <= k[length - 2]) {
        return true;
      } else if (
        //根据绝对值判断将要形成金叉
        Math.abs(j[length - 1] - k[length - 1]) <= 5 &&
        j[length - 1] < k[length - 1] &&
        Math.abs(j[length - 2] - k[length - 2]) >
          Math.abs(j[length - 1] - k[length - 1]) &&
        j[length - 2] < k[length - 2]
      ) {
        return true;
      }
      return false;
    },
    getDayData(code) {
      return new Promise((resole) => {
        let endTime = moment().format("YYYY-MM-DD");
        let beginTime = moment(Date.now() - 1000 * 60 * 60 * 24 * 30).format(
          "YYYY-MM-DD"
        );
        request
          .get(
            `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},day,${beginTime},${endTime},500,qfq`
          )
          .then((res) => {
            let qfqday = res.data[code].qfqday || [];
            let list = [];
            let list2 = []
            qfqday.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
              list2.push(item[2])
            });
            if (list.length == 0) {
              resole(null);
            } else {
              resole({
                kdj: indicator.kdj(list),
                rsi: indicator.rsi(list2),
                list: list,
              });
            }
          });
      });
    },
    getWeekData(code) {
      let oldTime = Date.now();
      return new Promise((resole) => {
        let endTime = moment().format("YYYY-MM-DD");
        let beginTime = moment(
          Date.now() - 1000 * 60 * 60 * 24 * 30 * 12
        ).format("YYYY-MM-DD");
        request
          .get(
            `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},week,${beginTime},${endTime},500,qfq`
          )
          .then((res) => {
            let qfqweek = res.data[code].qfqweek || [];
            let list = [];
            let list2 = []
            qfqweek.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
              list2.push(item[2])
            });
            if (list.length == 0) {
              resole(null);
            } else {
              let awaitTime = Date.now() - oldTime
              if(awaitTime > 0){
                setTimeout(()=>{
                  resole({
                    kdj: indicator.kdj(list),
                    rsi: indicator.rsi(list2),
                    list: list,
                  });
                },awaitTime < 50 ? 50-awaitTime: 50)
                return
              }
              resole({
                kdj: indicator.kdj(list),
                rsi: indicator.rsi(list2),
                list: list,
              });
            }
          });
      });
    },

    getMonthData(code) {
      return new Promise((resole) => {
        let endTime = moment().format("YYYY-MM-DD");
        let beginTime = moment(
          Date.now() - 1000 * 60 * 60 * 24 * 30 * 30
        ).format("YYYY-MM-DD");
        request
          .get(
            `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},month,${beginTime},${endTime},500,qfq`
          )
          .then((res) => {
            let qfqmonth = res.data[code].qfqmonth || [];
            let list = [];
            let list2 = [];
            qfqmonth.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
              list2.push(item[2])
            });
            if (list.length == 0) {
              resole(null);
            } else {
              resole({
                kdj: indicator.kdj(list),
                rsi: indicator.rsi(list2),
                list: list,
              });
            }
          });
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
a{
  margin: 10px;
}
</style>
