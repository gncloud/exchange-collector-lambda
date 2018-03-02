var AWS = require('aws-sdk');

const base = "krw";
const coins = ["BTC", "ETH", "DASH", "LTC", "ETC", "XRP", "BCH", "XMR", "ZEC", "QTUM", "BTG", "EOS"];

var lambda = new AWS.Lambda({
    region: 'ap-northeast-2'
});

exports.handler = (event, context, callback) => {
    for (let coin of coins) {
        let attr = {
            base: base,
            coin: coin
        };

        if (process.env.MODE != 'local') {
            lambda.invoke({
                FunctionName: 'bithumb-collector',
                Payload: JSON.stringify(attr)
            }, function(err, data) {
                if (err) console.log("err: ", base, coin, err, data);
            });
        } else {
            //FOR TEST
            var index = require("./bithumb-collector.js");
            index.handler(attr, context);
        }
    }
}
