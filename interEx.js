var _ = require('lodash');
var http = require('http');
var syncRequest = require('sync-request');
var getAllFunctions = require('./functions.js');

var requestToApi = require('./functions.js').requestToApi;

const TEAM_UID = "TtH8CwcTEcwcpP7BOoZBzg";
var symbol = "0005";

function main(callback){
		getAllFunctions.getAllMarketDataSync('0388', function(data){
		finalMinMax = [];
		getAllFunctions.getMinSync(data, function(minData){
			//console.log("Buy", minData);
			var test = _.minBy(minData, function(o) { return 'o.buy.price1'; });
			finalMinMax.push(test);
		});
		getAllFunctions.getMaxSync(data, function(maxData){
			//console.log("Sell", maxData);
			var test = _.maxBy(maxData, function(o) { return 'o.sell.price1'; });
			finalMinMax.push(test);
		});
		callback(finalMinMax);
	});
}

(function repeat(){
	main(function(res)
	{	
		console.log(res);
		var minQ = res[0].buy.qty1;
		var maxQ = res[1].sell.qty1;
		var minPrice = res[0].buy.price1;
		var maxPrice = res[1].sell.price1;
		var buyEx = res[0].exchange;
		var sellEx = res[1].exchange;

		if(maxQ > minQ){
			var quantity = minQ;
		}else{
			var quantity = maxQ;
		}
		
		if((maxPrice) < (minPrice) && quantity != null && quantity > 0){
				console.log("Buy "+quantity+ " at $"+minPrice+" from exchange "+ buyEx +" and sell to " + sellEx+" sell at $" + maxPrice );

				 var output = requestToApi({
					'apiCall':'orders',
					'symbol': symbol,
					'exchange': 'exchange'+buyEx,
					'orderTicket': {"side": "buy",
									"qty":quantity,
									"order_type":"market"}
				});
				
				console.log(output);
				
				/* var buy = 0;
				_.forEach(output.fills, function(value) {
					buy = buy + (value.price * value.qty);
				}); */
				 
			
				 var output2 = requestToApi({
					'apiCall':'orders',
					'symbol': symbol,
					'exchange': 'exchange'+sellEx,
					'orderTicket': {"side": "sell",
									"qty":quantity,
									"order_type":"market"}
				});
				
				console.log(output2);
				/* 	var sell = 0;
				_.forEach(output2.fills, function(value) {
					sell = sell + (value.price * value.qty);
				});
				
				console.log("Profit:" + (sell - buy)); */
		}
		repeat();
			
	});
})();