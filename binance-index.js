var request = require("request");
var binance = require("./exchange/binance");
var queue = require("./queue");

var market = "binance";
var API_URL = "https://api.binance.com/api/v1/trades?symbol=";

exports.handler = (event, context, callback) => {
    var coin = event.coin;
    var base = event.base;
    var symbol = event.symbol;

    var url = API_URL + symbol;
    request(url, function(error, response, body) {
        if (error) throw error;
        var orders = JSON.parse(body);
        var ohlcv = binance.getLatestOhlcv(orders);
        if (process.env.NODE_ENV == 'dev') {
            console.log(market, coin, base, ohlcv);
        }
        if(ohlcv) {
            queue.put(ohlcv.ohlcv, ohlcv.ts, market, coin, base);
        }
    });
}

