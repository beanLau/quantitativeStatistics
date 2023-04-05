<template>
  <div>
    <el-button type="primary" @click="clickCb">主要按钮</el-button>
    <el-table :data="list" max-height="500" border style="width: 100%">
      <el-table-column prop="typeName" label="类型"> </el-table-column>
      <el-table-column prop="code" label="编号"> </el-table-column>
      <el-table-column prop="name" label="名称"> </el-table-column>
      <el-table-column prop="market" label="市值"> </el-table-column>
      <el-table-column prop="ttm" label="市盈率"> </el-table-column>
      <el-table-column prop="dayKDJ" label="日金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.dayKDJ"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="weekKDJ" label="周金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.weekKDJ == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.weekKDJ == 2"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="weekKDJ2" label="周二次金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.weekKDJ2 == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.weekKDJ2 == 2"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="weekRsi" label="周RSI最小值">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.weekRsi"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="monthRsi" label="月RSI最小值">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.monthRsi"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="monthKDJ" label="月kdj金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.monthKDJ == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.monthKDJ == 2"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="monthKDJ2" label="月kdj2次金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.monthKDJ2 == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.monthKDJ2 == 2"
          ></i>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="股价"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import request from "../utils/request";
import indicator from "../utils/indicator";
import moment from "moment";
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
          let monthList = await this.getMonthData(code);
          if (monthList) {
            let kdjValue = this.computeIsKDJ(monthList.kdj);
            if (kdjValue) {
              let item = {
                typeName: typeName,
                code: code,
                weekKDJ: false,
                weekKDJ2: false,
                weekRsi: false,
                monthRsi: true,
                dayKDJ: false,
                monthKDJ: kdjValue,
                monthKDJ2: this.computeIs2KDJ(monthList.kdj),
                monthRsi: this.computeIsMinRSI(monthList.rsi),
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
                  item.dayKDJ = this.computeIsKDJ(dayList.kdj);

                  let weekList = await this.getWeekData(code);
                  if (weekList && this.computeIsMinRSI(weekList.rsi)) {
                    item.weekRsi = true;
                  } else if (weekList) {
                    item.weekRsi = false;
                  }

                  if (weekList) {
                    item.weekKDJ = this.computeIsKDJ(weekList.kdj);
                  }

                  if (weekList) {
                    item.weekKDJ2 = this.computeIs2KDJ(weekList.kdj);
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
        return 0;
      }
      let allList = k.map((k, index) => {
        return [k, d[index], j[index]];
      });
      let hasOneKDJ =
        allList.filter((item) => {
          return item[2] > item[0];
        }).length == 1;
      if(hasOneKDJ){
        return 2
      }
      let willKDJ =
        Math.abs(j[length - 1] - k[length - 1]) <= 5 &&
        j[length - 1] < k[length - 1] &&
        Math.abs(j[length - 2] - k[length - 2]) >
          Math.abs(j[length - 1] - k[length - 1]) &&
        j[length - 2] < k[length - 2];
      if(willKDJ){
        return 1
      }
      return 0
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
      if (j[length - 1] > 30) {
        return 0;
      }
      if (j[length - 1] > k[length - 1] && j[length - 2] <= k[length - 2]) {
        return 2;
      } else if (
        //根据绝对值判断将要形成金叉
        Math.abs(j[length - 1] - k[length - 1]) <= 5 &&
        j[length - 1] < k[length - 1] &&
        Math.abs(j[length - 2] - k[length - 2]) >
          Math.abs(j[length - 1] - k[length - 1]) &&
        j[length - 2] < k[length - 2]
      ) {
        return 1;
      }
      return 0;
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
