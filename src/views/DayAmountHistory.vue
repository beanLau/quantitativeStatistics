<template>
  <div>
    <el-table :data="list" max-height="100%" border style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
            <chart-k :optionData="scope.row.dayList" style="width:100%;height:300px;"></chart-k>
        </template>
      </el-table-column>
      <el-table-column prop="typeName" label="类型"> </el-table-column>
      <el-table-column prop="code" label="编号">
        <template slot-scope="scope">
          <div style="font-size: 12px">
            <div>编号: {{ scope.row.code }}</div>
            <div :style="{color: scope.row.state ? 'red': ''}">名称: {{ scope.row.name }}</div>
            <div>{{ scope.row.market }}（亿） {{ scope.row.ttm }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="weekKDJ" width="250px" label="量" style="padding:0;">
        <template slot-scope="">
          <svg width="250px" height="50px">
          </svg>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="股价"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import chartK from "../components/chart-k.vue"
import request from "../utils/request";
import indicator from "../utils/indicator";
import moment from "moment";
import allCode from "../all.js";
let allCodeList = [allCode[0]];
export default {
  name: "DayAmountHistory",
  components: {
    chartK
  },
  data() {
    return {
      isStop: false,
      timer: null,
      list: [],
      codeList: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    getCountPoints(list){
      return '0,80 5,20 10,40'
    },
    getKdjPoints(list) {
      list = [...list];
      // let cha = list.length - 52;
      // if (cha > 0) {
      //   list = list.splice(cha);
      // }
      let str = "";
      let arr = list.map((item) => {
        return 50 - item / 2;
      });
      let min = Math.min(...arr);
      if (min < 0) {
        arr = arr.map((item) => {
          item += -min;
          item += 2;
          return item;
        });
      }
      arr.map((item, index) => {
        str += ` ${index * 5},${item.toFixed(2)} `;
      });
      return str;
    },
    getHref(item) {
      return `https://api.mairui.club/hsmy/zjlr/${item.code
        .replace("sh", "")
        .replace("sz", "")}/75711c5d92566892c4`;
    },
    getHref2(item) {
      return `https://api.mairui.club/hsmy/jddxt/${item.code
        .replace("sh", "")
        .replace("sz", "")}/75711c5d92566892c4`;
    },
    async init() {
      this.getData();
    },
    clickCb() {
      this.isStop = !this.isStop;
    },
    isMaxAmount(list, ma20s){
      let value  = false
      let listData = [...list]
      listData = listData.splice(listData.length - 30)
      for(let i = listData.length - 1; i > 5;i--){
        let lastCount = listData[i][5]
        let a = listData[i-1] ? listData[i-1][5] || 0 : 0
        let b = listData[i-2] ? listData[i-2][5] || 0 : 0
        let c = listData[i-3] ? listData[i-3][5] || 0 : 0
        let d = listData[i-4] ? listData[i-4][5] || 0 : 0
        let e = listData[i-5] ? listData[i-5][5] || 0 : 0
        if(lastCount >= a + b+c +d +e){
          value = true
        }
      }
      if(!value){
        return false
      }
      let ma20 = ma20s[ma20s.length - 1]
      let maxPrice = list[list.length - 1][3]
      let minPrice = list[list.length - 1][4]
      return maxPrice > ma20 && minPrice < ma20
      
      return value
      let lastCount = listData.pop()[5]
      let totalCount = 0
      for(let i = 0;i< 8 ;i++){
        let item = listData.pop() || []
        totalCount += (item[5] || 0)
      }
      if(lastCount >= totalCount){
        //console.log(list[list.length - 1][5],totalCount, list[list.length - 2][5],list[list.length - 3][5],list[list.length - 4][5],list[list.length - 5][5],list[list.length - 6][5])
        return true
      }
      // totalCount = 0
      // lastCount += listData.pop()[5]
      // for(let i = 0; i< 7 ;i++){
      //   let item = listData.pop()
      //   totalCount += item[5]
      // }
      // if(lastCount >= totalCount){
      //   console.log(list[list.length - 1][5],list[list.length - 1][5],list[list.length - 1][5],list[list.length - 1][5],list[list.length - 1][5],list[list.length - 1][5])
      //   return true
      // }
      return false
    },
    async getData(list, typeName) {
      
      list = list || allCode || [];
      for (let i = 0; i < list.length; i++) {
        await this.waitStop();
        let item = list[i];
        
        if (item.children) {
          await this.getData(
            item.children,
            (typeName ? typeName + "-" : "") + item.name
          );
        } else {
          let arr = item.id.split(".");
          arr[1] = arr[1].toLocaleLowerCase();
          let code = arr.reverse().join("");
          let dayObj = await this.getDayData(code);
          if(dayObj && dayObj.qfqday && this.isMaxAmount(dayObj.qfqday, dayObj.ma20)){
            let listItem = {
              typeName: typeName,
              code: code,
              dayKDJ: 0,
              qfqday: dayObj.qfqday,
              price: dayObj.list[dayObj.list.length - 1],
              name: '',
              dayList: dayObj
            };
            listItem.name = dayObj.datas[1];
            this.list.push(listItem);
          }
          
          // if (weekList) {
          //   let amountValue = this.computeIsKDJ(weekList.kdj);
          //   if (amountValue.value) {
          //     let item = {
          //       typeName: typeName,
          //       code: code,
          //       //weekKDJ: kdjValue,
          //       weekKDJ2: this.computeIs2KDJ(weekList.kdj),
          //       weekRsi: this.computeIsMinRSI(weekList.rsi),
          //       dayKDJ: 0,
          //       monthKDJ: 0,
          //       price: 0,
          //       name: "",
          //     };
          //     let dayList = await this.getDayData(code);
          //     if (dayList) {
          //       item.name = dayList.datas[1];
          //       item.market = dayList.datas[45];
          //       item.ttm = dayList.datas[39];
          //       let list = dayList.list;
          //       if (list) {
          //         item.price = list[list.length - 1][2];
          //         item.dayKDJ = this.computeIsKDJ(dayList.kdj);
          //         let mothList = await this.getMonthData(code);
          //         item.monthKDJ = this.computeIsKDJ(mothList.kdj);
          //         this.list.push(item);
          //       }
          //     }
          //   }
          // }
        }
      }
    },
    waitStop() {
      if (!this.isStop) {
        return Promise.resolve(null);
      }
      return new Promise((resole) => {
        this.timer = setInterval(() => {
          if (!this.isStop) {
            clearInterval(this.timer);
            this.timer = null;
            resole(null);
          }
        }, 500);
      });
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
      if (rsi6[length - 1] > 30) {
        return false;
      }
      let firstValue = rsi6[0];
      while (firstValue == 0) {
        firstValue = rsi6.shift();
      }
      if (rsi6.length > 30) {
        rsi6 = rsi6.slice(rsi6.length - 30);
      }
      let isMin = true;
      let minPrice = Math.min(...rsi6);
      let lastPrice = rsi6[rsi6.length - 1];
      for (let i = 0; i < rsi6.length - 1; i++) {
        if (rsi6[i] < lastPrice) {
          isMin = false;
        }
      }
      return isMin || Math.abs(minPrice - lastPrice) < 1;
    },
    computeIsKDJ(list) {
      let k = list.k;
      let d = list.d;
      let j = list.j;
      let length = k.length;
      let value = 0;
      if (j[length - 1] > 30) {
        value = 0;
      }
      if (j[length - 1] > k[length - 1] && j[length - 2] <= k[length - 2]) {
        value = 2;
      } else if (
        //根据绝对值判断将要形成金叉
        Math.abs(j[length - 1] - k[length - 1]) <= 5 &&
        j[length - 1] < k[length - 1] &&
        Math.abs(j[length - 2] - k[length - 2]) >
          Math.abs(j[length - 1] - k[length - 1]) &&
        j[length - 2] < k[length - 2]
      ) {
        value = 1;
      }

      let minLength = Math.min(list.k.length, list.d.length, list.j.length);
      list.k = list.k.splice(list.k.length - minLength);
      list.d = list.d.splice(list.d.length - minLength);
      list.j = list.j.splice(list.j.length - minLength);
      return {
        value: value,
        list: list,
      };
    },
    getCurrentData(code){
      return new Promise((resole) => {
        request
          .get(
            `https://qt.gtimg.cn/q=${code}`
          )
          .then(async (res) => {
            let data = res.split('~')
            //日期，开盘、收盘、最高、最低、量
            resole([data[5],data[3],data[33],data[34],data[6]])
          })
      })
    },
    getDayData(code) {
      return new Promise((resole) => {
        let endTime = moment(Date.now()).format("YYYY-MM-DD");
        let beginTime = moment(Date.now() - 1000 * 60 * 60 * 24 * 700).format(
          "YYYY-MM-DD"
        );
        request
          .get(
            `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},day,${beginTime},${endTime},500,qfq`
          )
          .then(async (res) => {
            let qfqday = res.data[code].qfqday || [];
            if(qfqday.length && qfqday[qfqday.length - 1] && qfqday[qfqday.length - 1][0] != beginTime){
              let currentdata = await this.getCurrentData(code)
              currentdata.unshift(endTime)
              qfqday.push(currentdata)
            }
            let list = [];
            let list2 = [];
            qfqday.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
              list2.push(item[2]);
            });
            if (list.length == 0) {
              resole(null);
            } else {
              resole({
                // kdj: indicator.kdj(list),
                // rsi: indicator.rsi(list2),
                ma5: indicator.ma(list2, 5),
                ma20: indicator.ma(list2, 20),
                qfqday: qfqday,
                list: list,
                datas: res.data[code].qt[code],
                kdj: indicator.kdj(list),
                rsi: indicator.rsi(list2),
                boll: indicator.boll(list2),
                dataList: qfqday

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
            let list2 = [];
            qfqweek.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
              list2.push(item[2]);
            });
            if (list.length == 0) {
              resole(null);
            } else {
              let awaitTime = Date.now() - oldTime;
              if (awaitTime > 0) {
                setTimeout(
                  () => {
                    resole({
                      kdj: indicator.kdj(list),
                      rsi: indicator.rsi(list2),
                      list: list,
                    });
                  },
                  awaitTime < 50 ? 50 - awaitTime : 50
                );
                return;
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
          Date.now() - 1000 * 60 * 60 * 24 * 30 * 12 * 5
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
              list2.push(item[2]);
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
.el-table .el-table__cell {
  padding: 0;
  margin: 0;
}
.cell {
  padding: 0 !important;
  margin: 0 !important;
}
svg {
  position: relative;
  overflow: hidden;
}
polyline {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
