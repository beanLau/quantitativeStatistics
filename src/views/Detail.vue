<template>
    <div>
        <div class="search-wrap">
            <el-input style="width: 180px;margin-right: 20px;" v-model="code" placeholder="请输入股票代码"></el-input>
            <el-button type="primary" @click="init">查询详情</el-button>
        </div>
        <el-table :data="info" border style="width: 100%">
            <el-table-column prop="name" label="名称">
            </el-table-column>
            <el-table-column prop="code" label="编号">
            </el-table-column>
            <el-table-column prop="dtttm" label="动态市盈率">
            </el-table-column>
            <el-table-column prop="ttm" label="市盈率TTM">
            </el-table-column>
            <el-table-column prop="chg" label="涨跌幅">
            </el-table-column>
        </el-table>

        <el-table :data="dayList" border style="width: 100%">
            <el-table-column prop="zdf" label="涨跌幅(%)">
                <template slot-scope="scope">
                    <span :class="scope.row.zdf > 0 ? 'red-value':'green-value'">{{scope.row.zdf}} %</span>
                </template>
            </el-table-column>
            <el-table-column prop="hsl" label="换手率(%)">
                <template slot-scope="scope">
                    <span :class="scope.row.hsl > 0 ? 'red-value':'green-value'">{{scope.row.hsl}} %</span>
                </template>
            </el-table-column>
            <el-table-column prop="jlr" label="净流入(万)">
                <template slot-scope="scope">
                    <span :class="parseFloat(scope.row.jlr) > 0 ? 'red-value':'green-value'">{{ (parseFloat(scope.row.jlr).toFixed(2) / 1000).toFixed(2) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="jlrl" label="净流入率(%)">
            </el-table-column>
            <el-table-column prop="zljlr" label="主力净流入(万)">
                <template slot-scope="scope">
                    <span :class="parseFloat(scope.row.zljlr) > 0 ? 'red-value':'green-value'">{{ (parseFloat(scope.row.zljlr).toFixed(2) / 1000).toFixed(2) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="zljlrl" label="主力净流入率(%)">
            </el-table-column>
            <el-table-column prop="hyjlr" label="行业净流入(万)">
                <template slot-scope="scope">
                    <span :class="parseFloat(scope.row.hyjlr) > 0 ? 'red-value':'green-value'">{{ (parseFloat(scope.row.hyjlr).toFixed(2) / 1000).toFixed(2) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="hyjlrl" label="行业净流入率(%)">
            </el-table-column>
        </el-table>

        <el-table :data="dayListTJ" border style="width: 100%">
            <el-table-column prop="jlr3" label="近3日主力净流入(万）">
                <template slot-scope="scope">
                    <span :class="parseFloat(scope.row.jlr3) > 0 ? 'red-value':'green-value'">{{ (parseFloat(scope.row.jlr3) / 1000 ).toFixed(2)}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="jlr5" label="近5日主力净流入(万）">
                <template slot-scope="scope">
                    <span :class="parseFloat(scope.row.jlr5) > 0 ? 'red-value':'green-value'">{{ (parseFloat(scope.row.jlr5) / 1000 ).toFixed(2)}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="jlr10" label="近10日主力净流入(万）">
                <template slot-scope="scope">
                    <span :class="parseFloat(scope.row.jlr10) > 0 ? 'red-value':'green-value'">{{ (parseFloat(scope.row.jlr10) / 1000 ).toFixed(2)}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="jlrl3" label="近3日主力净流入率(%）">
            </el-table-column>
            <el-table-column prop="jlrl5" label="近5日主力净流入率(%）">
            </el-table-column>
            <el-table-column prop="jlrl10" label="近10日主力净流入率(%）">
            </el-table-column>
        </el-table>
    </div>
</template>
  
<script>
import request from "../utils/request";
import moment from "moment";
import dayList from "./day.js"
import dayListTJ from "./daytj.js"
export default {
    name: "Home",
    components: {},
    data() {
        return {
            code: '',
            info: [],
            dayList: dayList,
            dayListTJ: dayListTJ
        };
    },
    mounted() {
        console.log(this.$route.query)
        //this.init();
    },
    methods: {
        init() {
            this.getInfo()
            //this.getDayLiuru();// 每日流入
            //this.getLiuruTj(); //流入统计
        },
        getDayLiuru() {
            
            request
                .get(
                    `https://api.mairui.club/hsmy/zjlr/${this.code.replace('sh','').replace('sz','')}/75711c5d92566892c4`
                )
                .then((res) => {
                    console.log(res)
                });
        },
        getLiuruTj() {

        },
        getInfo() {
            let endTime = moment().format("YYYY-MM-DD");
            let beginTime = moment(Date.now() - 1000 * 60 * 60 * 24 * 30).format(
                "YYYY-MM-DD"
            );
            request
                .get(
                    `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${this.code},day,${beginTime},${endTime},500,qfq`
                )
                .then((res) => {
                    let list = res.data[this.code].qt[this.code]
                    let item = {}
                    item.name = list[1]
                    item.code = this.code
                    item.market = list[45]  //市值
                    item.ttm = list[39] //市盈率TTM
                    item.dtttm = list[52] //动态市盈率
                    item.chg = list[32] //涨跌幅
                    this.info = [item]
                });
        }
    },
};
</script>
  
<style>
.search-wrap{
    margin: 20px;
    text-align: left;
}
.green-value{
    color: greenyellow;
    text-align: right;
    width: 100%;
    display: inline-block;
}
.red-value{
    color: red;
    text-align: right;
    width: 100%;
    display: inline-block;
}
</style>
  