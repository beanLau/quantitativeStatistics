<template>
  <div>
    <el-button type="primary" @click="clickCb">主要按钮</el-button>
    <el-table :data="list" max-height="500" border style="width: 100%">
      <el-table-column prop="typeName" label="类型"> </el-table-column>
      <el-table-column prop="code" label="编号">
        <template slot-scope="scope">
          <div style="font-size: 12px">
            <div>编号: {{ scope.row.code }}</div>
            <div :style="{ color: scope.row.state ? 'red' : '' }">
              名称: {{ scope.row.name }} {{ scope.row.state }}
            </div>
            <div>描述: {{ scope.row.desc }}</div>
            <div>{{ scope.row.market }}（亿） {{ scope.row.ttm }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="weekKDJ"
        width="250px"
        label="周RSI"
        style="padding: 0"
      >
        <template slot-scope="scope">
          <svg width="250px" height="50px">
            <polyline
              width="350px"
              height="50px"
              :points="getRsiPoints(scope.row.weekRsi.list.rsi6)"
              style="fill: none; stroke: #666; stroke-width: 1px"
            ></polyline>
            <polyline
              width="350px"
              height="50px"
              :points="getRsiPoints(scope.row.weekRsi.list.rsi12)"
              style="fill: none; stroke: #f4c063; stroke-width: 1px"
            ></polyline>
            <polyline
              width="350px"
              height="50px"
              :points="getRsiPoints(scope.row.weekRsi.list.rsi24)"
              style="fill: none; stroke: #b663f4; stroke-width: 1px"
            ></polyline>
          </svg>
        </template>
      </el-table-column>
      <el-table-column prop="weekRsi" label="周RSI-Min">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.weekRsi.value == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.weekRsi.value == 2"
          ></i>
          {{ scope.row.weekRsi.last }}
        </template>
      </el-table-column>
      <el-table-column
        prop="weekKDJ"
        width="250px"
        label="周RSI"
        style="padding: 0"
      >
        <template slot-scope="scope">
          <svg width="250px" height="50px">
            <polyline
              width="350px"
              height="50px"
              :points="getRsiPoints(scope.row.monthRsi.list.rsi6)"
              style="fill: none; stroke: #666; stroke-width: 1px"
            ></polyline>
            <polyline
              width="350px"
              height="50px"
              :points="getRsiPoints(scope.row.monthRsi.list.rsi12)"
              style="fill: none; stroke: #f4c063; stroke-width: 1px"
            ></polyline>
            <polyline
              width="350px"
              height="50px"
              :points="getRsiPoints(scope.row.monthRsi.list.rsi24)"
              style="fill: none; stroke: #b663f4; stroke-width: 1px"
            ></polyline>
          </svg>
        </template>
      </el-table-column>

      <el-table-column prop="monthRsi" label="月RSI-Min">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.monthRsi.value == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.monthRsi.value == 2"
          ></i>
          {{ scope.row.monthRsi.last }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="股价"> </el-table-column>
    </el-table>
    <ul>
      <li style="margin-right: 4px" v-for="item in list" :key="item.code">{{
        item.name
      }}</li>
    </ul>
  </div>
</template>

<script>
import request from "../utils/request";
import indicator from "../utils/indicator";
import moment, { min } from "moment";
import allCode from "../all.js";
let allCodeList = [allCode[0]];
export default {
  name: "Home",
  components: {},
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
    getRsiPoints(rsi) {
      let cha = rsi.length - 30;
      if (cha > 0) {
        rsi = rsi.splice(cha);
      }
      rsi = [...rsi];
      let str = "";
      let arr = rsi.map((item) => {
        return 50 - item / 1.5;
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
        str += ` ${index * 8},${item.toFixed(2)} `;
      });
      return str;
    },
    async init() {
      this.getData();
    },
    clickCb() {
      this.isStop = !this.isStop;
    },
    async getData(list, typeName) {
      list = list || allCode || [];
      for (let i = 0; i < list.length; i++) {
        await this.waitStop();
        let data = list[i];
        if (data.children) {
          await this.getData(
            data.children,
            (typeName ? typeName + "-" : "") + data.name
          );
        } else {
          let arr = data.id.split(".");
          arr[1] = arr[1].toLocaleLowerCase();
          let code = arr.reverse().join("");
          let weekList = await this.getWeekData(code);
          if (data.state && weekList) {
            let booldata = this.computeIsMinBoll(weekList.list, weekList.boll);
            if (booldata) {
              let rsidata = this.computeIsMinRSI(weekList.rsi);
              let item = {
                state: data.state ? "央国企" : "",
                desc: data.desc || "",
                typeName: typeName,
                code: code,
                weekKDJ: false,
                weekKDJ2: false,
                weekRsi: rsidata,
                weekBool: true,
                monthRsi: 0,
                dayKDJ: false,
                monthKDJ: this.computeIsKDJ(weekList.kdj),
                price: 0,
                name: "",
              };
              let dayList = await this.getDayData(code);
              if (dayList) {
                item.name = dayList.datas[1];
                item.market = dayList.datas[45];
                item.ttm = dayList.datas[39];
                let list = dayList.list;
                if (list) {
                  item.price = list[list.length - 1][2];
                  if (dayList && this.computeIsKDJ(dayList.kdj)) {
                    item.dayKDJ = true;
                  } else if (dayList) {
                    item.dayKDJ = false;
                  }
                  let monthList = await this.getMonthData(code);
                  let monthrsi = this.computeIsMinRSI(monthList.rsi);
                  item.monthRsi = monthrsi;
                  if (monthList && this.computeIsKDJ(monthList.kdj)) {
                    item.monthKDJ = true;
                  } else if (monthList) {
                    item.monthKDJ = false;
                  }

                  if (monthList && this.computeIs2KDJ(monthList.kdj)) {
                    item.monthKDJ2 = true;
                  } else if (monthList) {
                    item.monthKDJ2 = false;
                  }
                  this.list.push(item);
                }
              }
            }
          }
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
    computeIsMinBoll(list, boll) {
      let lastPrice = list[list.length - 1][2];
      let lowers = boll.lower;
      let uppers = boll.upper;
      let mids = boll.mid;
      let lowerVal = lowers[lowers.length - 1];
      let upperVal = uppers[uppers.length - 1];
      let midVal = mids[mids.length - 1];
      if (lastPrice > lowerVal && lastPrice < midVal) {
        return true;
      }
      return false;
    },
    computeIsMinRSI(list) {
      let rsi6 = list.rsi6;
      let length = rsi6.length;
      // if (rsi6[length - 1] > 30) {
      //   return false;
      // }
      let firstValue = rsi6[0];
      // while(firstValue == 0){
      //   firstValue = rsi6.shift()
      // }
      while (rsi6.length > 30) {
        rsi6.shift();
      }
      let isMin = true;
      let minPrice = Math.min(...rsi6);
      let lastPrice = rsi6[rsi6.length - 1];
      for (let i = 0; i < rsi6.length - 1; i++) {
        if (rsi6[i] < lastPrice) {
          isMin = false;
        }
      }
      if (isMin && lastPrice >= 40) {
        isMin = false;
      }
      //let lastValue = rsi6[rsi6.length - 1]
      // let index = rsi6.sort().findIndex(item=>{
      //   return item == lastValue
      // })
      let value = 0;
      if (isMin) {
        value = 1;
      } else if (Math.abs(minPrice - lastPrice) < 1) {
        value = 2;
      }
      let minLength = Math.min(
        list.rsi6.length,
        list.rsi12.length,
        list.rsi24.length
      );
      list.rsi6 = list.rsi6.splice(list.rsi6.length - minLength);
      list.rsi12 = list.rsi12.splice(list.rsi12.length - minLength);
      list.rsi24 = list.rsi24.splice(list.rsi24.length - minLength);
      return {
        list: list,
        value: value,
        last: parseFloat(lastPrice).toFixed(2),
      };
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
                kdj: indicator.kdj(list),
                rsi: indicator.rsi(list2),
                list: list,
                datas: res.data[code].qt[code],
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
          Date.now() - 1000 * 60 * 60 * 24 * 30 * 12 * 3
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
                      boll: indicator.boll(list2),
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
                boll: indicator.boll(list2),
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
          Date.now() - 1000 * 60 * 60 * 24 * 365 * 5
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
</style>
