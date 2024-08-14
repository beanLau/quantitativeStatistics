<template>
  <div class="chart-k">
    <lwt-charts :option="option"></lwt-charts>
  </div>
</template>

<script>
const upColor = '#00da3c';
const downColor = '#ec0000';
export default {
  name: "chartK",
  props: {
    optionData: {}, //数据为日期、open，close，lowest，highest
  },
  data() {
    return {};
  },
  computed: {
    xAxisData() {
      let data = this.optionData.dataList.map((item) => {
        return item[0];
      });
      return data;
    },
    seriesData() {
      let data = this.optionData.dataList.map((item) => {
        return [item[1], item[2], item[4], item[3]];
      });
      return data;
    },
    BARData() {
      let data = this.optionData.dataList.map((item) => {
        return {
          value: item[5],
          itemStyle: {
            color: item[1] > item[2] ? "green" : "red",
          },
        };
      });
      return data;
    },
    UPPData() {
      return this.optionData.boll.lower;
    },
    MIDData() {
      return this.optionData.boll.mid;
    },
    LOWData() {
      return this.optionData.boll.upper;
    },
    option() {
      return {
        title: {
          text: "",
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params,data) {
            let res = params[0].name + '<br/>'
            params.map(param=>{
              if(param.seriesName === 'k'){
                res += `开:${param.value[0]} 收:${param.value[1]} 低:${param.value[2]} 高:${param.value[3]} <br/>`
              }else if(param.seriesName === 'LOW'){
                res += `boll-low: ${param.value.toFixed(2)}  <br/>`
              }else if(param.seriesName === 'MID'){
                res += `boll-mid: ${param.value.toFixed(2)}  <br/>`
              }else if(param.seriesName === 'UPP'){
                res += `boll-upp: ${param.value.toFixed(2)}  <br/>`
              }else if(param.seriesName === 'RSI1'){
                res += `RSI1: ${param.value.toFixed(2)}  <br/>`
              }else if(param.seriesName === 'Volume'){
                res += `量: ${param.value.toFixed(2)}  <br/>`
              }
            })
            // var res = params[0].seriesName + " " + params[0].name;
            // res +=
            //   "<br/>  开盘 : " +
            //   params[0].value[0] +
            //   "  最高 : " +
            //   params[0].value[3];
            // res +=
            //   "<br/>  收盘 : " +
            //   params[0].value[1] +
            //   "  最低 : " +
            //   params[0].value[2];
            return res;
          },
        },
        legend: {
          bottom: 10,
          left: 'center',
          data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataZoom: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },

        axisPointer: {
          link: [
            {
              xAxisIndex: "all",
            },
          ],
          label: {
            backgroundColor: "#777",
          },
        },
        brush: {
          xAxisIndex: "all",
          brushLink: "all",
          outOfBrush: {
            colorAlpha: 0.1,
          },
        },
        visualMap: {
          show: false,
          seriesIndex: 5,
          dimension: 2,
          pieces: [
            {
              value: 1,
              color: downColor,
            },
            {
              value: -1,
              color: upColor,
            },
          ],
        },
        grid: [
          {
            top: "0%",
            left: "10%",
            right: "8%",
            height: "50%",
          },
          {
            left: "10%",
            right: "8%",
            top: "55%",
            height: "10%",
          },
          {
            left: "10%",
            right: "8%",
            top: "65%",
            height: "25%",
          },
        ],
        xAxis: [
          {
            type: "category",
            data: this.xAxisData,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: "dataMin",
            max: "dataMax",
            axisPointer: {
              z: 100,
            },
          },
          {
            type: "category",
            gridIndex: 1,
            data: this.xAxisData,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: "dataMin",
            max: "dataMax",
          },
          {
            type: "category",
            gridIndex: 2,
            data: this.xAxisData,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: "dataMin",
            max: "dataMax",
          },
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: true,
            },
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
          {
            scale: true,
            gridIndex: 2,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
        ],
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: [0, 1],
            start: 0,
            end: 100,
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: "slider",
            top: "85%",
            start: 0,
            end: 100,
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: "slider",
            top: "85%",
            start: 8,
            end: 100,
          },
        ],
        series: [
          {
            name: "k",
            type: "candlestick",
            data: this.seriesData,
          },
          {
            name: "UPP",
            type: "line",
            showSymbol: false,
            data: this.UPPData,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
            },
          },
          {
            name: "MID",
            type: "line",
            showSymbol: false,
            data: this.MIDData,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
            },
          },
          {
            name: "LOW",
            type: "line",
            showSymbol: false,
            data: this.LOWData,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
            },
          },
          {
            name: "Volume",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.BARData,
          },
          {
            name: "RSI1",
            type: "line",
            showSymbol: false,
            data: this.optionData.rsi.rsi6,
            colorBy: 'data',
            xAxisIndex: 2,
            yAxisIndex: 2,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
            },
          },
          {
            name: "RSI2",
            type: "line",
            showSymbol: false,
            data: this.optionData.rsi.rsi12,
            colorBy: 'data',
            xAxisIndex: 2,
            yAxisIndex: 2,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
            },
          },
          {
            name: "RSI3",
            type: "line",
            showSymbol: false,
            data: this.optionData.rsi.rsi24,
            colorBy: 'data',
            xAxisIndex: 2,
            yAxisIndex: 2,
            smooth: true,
            lineStyle: {
              opacity: 0.5,
            },
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
</style>
