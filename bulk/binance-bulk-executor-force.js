/*
바이낸스 강제로 특정기간 데이터 influxDB에 업데이트 실행
*/
const AWS = require('aws-sdk')
const lambda = new AWS.Lambda({region: 'ap-northeast-2'})
const axios = require('axios')
const endpoint = 'http://13.125.196.188:8086/query?'
const config = { auth: { username: 'joonwoo', password: 'joonwoo1' } }
const collector = require('./binance-bulk-collector-force')

// 설정
const isDev = true
const startTime = new Date(2018, 5, 1, 0, 0, 0)
const limit = 720 // max: 1000

const getMeasurementsList = (exchangeId) => {
  const url = endpoint + encodeURI(`q=SHOW MEASUREMENTS ON coin_v2`)
  return axios.get(url, config).then((response) => {
    let result = response.data['results'][0]
    return result['series'][0]['values'].filter((o, i) => {
      // 해당 거래소만 리턴.
      return o[0].startsWith(exchangeId)
    })
  })
}
const sleep = (delay) => {
   var start = new Date().getTime()
   while (new Date().getTime() < start + delay);
}

exports.handler = (event, context, callback) => {
  getMeasurementsList('binance')
  .then((measurements) => {
    let curTime = new Date()
    curTime.setTime(startTime.getTime())
    let endTime = new Date()
    let isEnd = false
    let loop1 = 0
    while ( !isEnd ) {
      loop1++
      let loop2 = 0
      for (let i=0; i < measurements.length; i++) {
        loop2++
        m = measurements[i][0]
        exchange = m.split('_')[0]
        coin = m.split('_')[1].toUpperCase()
        base = m.split('_')[2].toUpperCase()
        let attr = {
          exchange: exchange,
          coin: coin,
          base: base,
          symbol: `${coin}/${base}`,
          since: curTime.getTime(),
          limit: limit
        }
        if(!isDev) {
          // lambda function
        } else {
          // local function
          collector.handler(attr)
        }
      }
      curTime.setMinutes(curTime.getMinutes() + limit)
      console.log(`loop#1: ${loop1}, loop#2: ${loop2} curTime: ${curTime.getTime()}, limit: ${limit}`)
      if (endTime.getTime() < curTime.getTime()) {
        curTime = endTime
      } else if(endTime.getTime() == curTime.getTime()) {
        isEnd = true
      }
      sleep(100)
    }
  })

}

exports.handler()
