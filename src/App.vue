<template>
  <div id="app">
    <table>
      <tr>
        <th>编号</th>
        <th>日金叉</th>
        <th>周金叉</th>
        <th>月金叉</th>
        <th>当前价格</th>
      </tr>
      <tr v-for="(item, index) of list" :key="index">
        <td>{{ item.code }}</td>
        <td>{{ item.dayKDJ }}</td>
        <td>{{ item.weekKDJ }}</td>
        <td>{{ item.monthKDJ }}</td>
        <td>{{ item.price }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import request from "./utils/request";
import indicator from "./utils/indicator";
import moment from "moment";
export default {
  name: "App",
  components: {},
  data() {
    return {
      list: [],
      codeList: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // for (let i = 598; i <= 700; i++) {
      //   let str = i + "";
      //   this.codeList.push("sz000" + str.padStart(3, 0));
      // }
      // for (let i = 1; i <= 999; i++) {
      //   let str = i + "";
      //   this.codeList.push("sz000" + str.padStart(3, 0));
      // }
      for (let i = 300; i <= 999; i++) {
        let str = i + "";
        this.codeList.push("sz300" + str.padStart(3, 0));
      }
      for (let i = 1; i <= 999; i++) {
        let str = i + "";
        this.codeList.push("sh600" + str.padStart(3, 0));
      }
      this.findKdjData();
    },
    async findKdjData() {
      let index = 0;
      let length = this.codeList.length;
      let timer = setInterval(async () => {
        let currentIndex = index % length;
        let code = this.codeList[currentIndex];
        let weekList = await this.getWeekData(code);
        if (weekList && this.computeIsKDJ(weekList.kdj)) {
          let dayList = await this.getDayData(code);
          let list = dayList.list;
          let item = {
            code: code,
            weekKDJ: true,
            dayKDJ: true,
            price: list[list.length - 1][2],
          };
          if (dayList && this.computeIsKDJ(dayList.kdj)) {
            item.dayKDJ = true;
          } else if (dayList) {
            item.dayKDJ = false;
          }
          let mothList = await this.getMonthData(code);
          if (mothList && this.computeIsKDJ(mothList.kdj)) {
            item.monthKDJ = true;
          } else if (mothList) {
            item.monthKDJ = false;
          }
          this.list.push(item);
        }
        index++;
      }, 1000);
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
            qfqday.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
            });
            if (list.length == 0) {
              resole(null);
            } else {
              resole({
                kdj: indicator.kdj(list),
                list: list,
              });
            }
          });
      });
    },
    getWeekData(code) {
      return new Promise((resole) => {
        let endTime = moment().format("YYYY-MM-DD");
        let beginTime = moment(
          Date.now() - 1000 * 60 * 60 * 24 * 30 * 7
        ).format("YYYY-MM-DD");
        request
          .get(
            `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},week,${beginTime},${endTime},500,qfq`
          )
          .then((res) => {
            let qfqweek = res.data[code].qfqweek || [];
            let list = [];
            qfqweek.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
            });
            if (list.length == 0) {
              resole(null);
            } else {
              resole({
                kdj: indicator.kdj(list),
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
            qfqmonth.map((item) => {
              item.map((price, index) => {
                if (index) {
                  item[index] = parseFloat(price);
                }
              });
              //最高，最低，收盘
              list.push([item[3], item[4], item[2]]);
            });
            if (list.length == 0) {
              resole(null);
            } else {
              resole({
                kdj: indicator.kdj(list),
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
  margin-top: 60px;
}
</style>
