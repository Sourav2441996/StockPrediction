var _ = require('lodash');
var http = require('http');
var syncRequest = require('sync-request');
var getAllMarketDataSync = require('./functions.js').getAllMarketDataSync;
var requestToApi = require('./functions.js').requestToApi;

const TEAM_UID = "TtH8CwcTEcwcpP7BOoZBzg";
var symbol = "0388";

(function repeat(){
	getAllMarketDataSync(symbol, function(data){
		var stockData = data;
		console.log(stockData);
		
		var minPrice = 10000000;
		var exchangeOfMin = 4;

		var i = 1;
		_.forEach(stockData, function(value) {
			//console.log("Sell: %j\n", value.sell);
			var min = 10000000;
			_.forEach(value.sell, function(key, val){
				if(parseFloat(val) < min){
					min = parseFloat(val);
				}
			});

			if(min < parseFloat(minPrice)){
				minPrice = min;
				exchangeOfMin = i;
			}
			i++;
		});

		 console.log("min:"+minPrice);
		 console.log(stockData[exchangeOfMin-1].sell[minPrice]);
		 console.log(exchangeOfMin);

		var maxPrice = -10;
		var exchangeOfMax = 4;
		var i = 1;

		_.forEach(stockData, function(value) {
			//console.log("Buy: %j\n", value.buy);
			var max = -10;
			_.forEach(value.buy, function(key, val){
				if(parseFloat(val) > max){
					max = parseFloat(val);
				}
			});

			if(max > parseFloat(maxPrice)){
				maxPrice = max;
				exchangeOfMax = i;
			}
			i++;
		});

		 console.log("max:"+maxPrice);
		 console.log(stockData[exchangeOfMax-1].buy[maxPrice]);
		 console.log(exchangeOfMax);

		if( stockData[exchangeOfMax-1].buy[maxPrice] > stockData[exchangeOfMin-1].sell[minPrice]){
			var quantity = stockData[exchangeOfMin-1].sell[minPrice];
		}else{
			var quantity = stockData[exchangeOfMax-1].buy[maxPrice];
		}

		if(parseFloat(maxPrice) > parseFloat(minPrice) && quantity != null && quantity > 0){
			console.log("Buy "+quantity+ " at $"+minPrice+" from exchange "+ exchangeOfMin +" and sell to " + exchangeOfMax+" sell at $" + maxPrice );

			var output = requestToApi({
				'apiCall':'orders',
				'symbol': symbol,
				'exchange': 'exchange'+exchangeOfMin,
				'orderTicket': {"side": "buy",
								"qty":quantity,
								"order_type":"market"}
			});
			
			console.log(output);
			
	/* 		var buy = 0;
			_.forEach(output.fills, function(value) {
				buy = buy + (value.price * value.qty);
			});
			 */
		
			var output2 = requestToApi({
				'apiCall':'orders',
				'symbol': symbol,
				'exchange': 'exchange'+exchangeOfMax,
				'orderTicket': {"side": "sell",
								"qty":quantity,
								"price": maxPrice * 1.01,
								"order_type":"limit"}
			});
			
			console.log(output2);
	/* 		var sell = 0;
			_.forEach(output2.fills, function(value) {
				sell = sell + (value.price * value.qty);
			});
			
			console.log("Profit:" + (sell - buy)); */
		}
		repeat();
	});
})();
