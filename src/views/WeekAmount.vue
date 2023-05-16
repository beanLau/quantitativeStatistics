<template>
  <div>
    <!-- <el-button type="primary" @click="clickCb">主要按钮</el-button> -->
    <el-table :data="list" max-height="100%" border style="width: 100%">
      <el-table-column prop="typeName" label="类型"> </el-table-column>
      <el-table-column prop="code" label="编号">
        <template slot-scope="scope">
          <div style="font-size: 12px">
            <div>编号: {{ scope.row.code }}</div>
            <div>名称: {{ scope.row.name }}</div>
            <div>{{ scope.row.market }}（亿） {{ scope.row.ttm }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="dayKDJ" label="日金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.dayKDJ.value == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.dayKDJ.value == 2"
          ></i>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="weekKDJ"
        width="270px"
        label="周kdj"
        style="padding: 0"
      >
        <template slot-scope="scope">
          <svg width="270px" height="65px">
            <polyline
              width="250px"
              height="65px"
              :points="getKdjPoints(scope.row.weekKDJ.list.k)"
              style="fill: none; stroke: #666; stroke-width: 1px"
            ></polyline>
            <polyline
              width="250px"
              height="65px"
              :points="getKdjPoints(scope.row.weekKDJ.list.d)"
              style="fill: none; stroke: #f4c063; stroke-width: 1px"
            ></polyline>
            <polyline
              width="250px"
              height="65px"
              :points="getKdjPoints(scope.row.weekKDJ.list.j)"
              style="fill: none; stroke: #b663f4; stroke-width: 1px"
            ></polyline>
          </svg>
        </template>
      </el-table-column> -->
      <el-table-column prop="weekKDJ" label="周金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.weekKDJ.value == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.weekKDJ.value == 2"
          ></i>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="weekKDJ2" label="周二次金叉">
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
      </el-table-column> -->
      <!-- <el-table-column prop="weekRsi" label="周RSI最小值">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.weekRsi"
          ></i>
        </template>
      </el-table-column> -->
      <!-- <el-table-column
        prop="weekKDJ"
        width="270px"
        label="月kdj"
        style="padding: 0"
      >
        <template slot-scope="scope">
          <svg width="270px" height="65px">
            <polyline
              width="250px"
              height="65px"
              :points="getKdjPoints(scope.row.monthKDJ.list.k)"
              style="fill: none; stroke: #666; stroke-width: 1px"
            ></polyline>
            <polyline
              width="250px"
              height="65px"
              :points="getKdjPoints(scope.row.monthKDJ.list.d)"
              style="fill: none; stroke: #f4c063; stroke-width: 1px"
            ></polyline>
            <polyline
              width="250px"
              height="65px"
              :points="getKdjPoints(scope.row.monthKDJ.list.j)"
              style="fill: none; stroke: #b663f4; stroke-width: 1px"
            ></polyline>
          </svg>
        </template>
      </el-table-column> -->
      <el-table-column prop="monthKDJ" label="月KDJ金叉">
        <template slot-scope="scope">
          <i
            class="el-icon-success"
            type="primary"
            style="color: rgb(223 236 249)"
            v-if="scope.row.monthKDJ.value == 1"
          ></i>
          <i
            class="el-icon-success"
            type="primary"
            style="color: #409eff"
            v-if="scope.row.monthKDJ.value == 2"
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
          let weekList = await this.getWeekData(code);
          debugger
          console.log(weekList)
          if (weekList) {
            let amountValue = this.computeIsKDJ(weekList.kdj);
            if (amountValue.value) {
              let item = {
                typeName: typeName,
                code: code,
                //weekKDJ: kdjValue,
                weekKDJ2: this.computeIs2KDJ(weekList.kdj),
                weekRsi: this.computeIsMinRSI(weekList.rsi),
                dayKDJ: 0,
                monthKDJ: 0,
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
                  let mothList = await this.getMonthData(code);
                  item.monthKDJ = this.computeIsKDJ(mothList.kdj);
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
