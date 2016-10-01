var _ = require('lodash');
var http = require('http');
var syncRequest = require('sync-request');

const TEAM_UID="PkkYempGWJeQr3AFYzcOWA";


function requestToApi(apiFunctions){
	if (apiFunctions.apiCall === 'orders'){

		apiFunctions.orderTicket.team_uid = TEAM_UID;
		apiFunctions.orderTicket.symbol = apiFunctions.symbol;

		var request = syncRequest(
			'POST',
			'http://cis2016-'+apiFunctions.exchange+'.herokuapp.com/api/'+apiFunctions.apiCall,
			{
				'headers': {
					'Content-Type': 'application/json'
				},
				'json': apiFunctions.orderTicket
			}
		);

		return JSON.parse(request.getBody());

	} else {
		if (apiFunctions.symbol) {
			apiFunctions.apiCall = apiFunctions.apiCall+'/'+apiFunctions.symbol;
		}

		var request = syncRequest(
			'GET',
			'http://cis2016-'+apiFunctions.exchange+'.herokuapp.com/api/'+apiFunctions.apiCall
		);

		return JSON.parse(request.getBody());

	}
}
var symbol = "0388";

while(true){
	var stockJSONex1 = requestToApi({
		'apiCall':'market_data',
		'symbol': symbol,
		'exchange': 'exchange1'
	});

	var stockJSONex2 = requestToApi({
		'apiCall':'market_data',
		'symbol': symbol,
		'exchange': 'exchange2'
	});

	var stockJSONex3 = requestToApi({
		'apiCall':'market_data',
		'symbol': symbol,
		'exchange': 'exchange3'
	});

	var stockData = [stockJSONex1, stockJSONex2, stockJSONex3];
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

	// console.log(minPrice);
	// console.log(stockData[exchangeOfMin-1].sell[minPrice]);
	// console.log(exchangeOfMin);

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

	// console.log(maxPrice);
	// console.log(stockData[exchangeOfMax-1].buy[maxPrice]);
	// console.log(exchangeOfMax);

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
		if(output.filled_qty > 0){
			var output2 = requestToApi({
				'apiCall':'orders',
				'symbol': symbol,
				'exchange': 'exchange'+exchangeOfMax,
				'orderTicket': {"side": "sell",
								"qty":output.filled_qty,
								"order_type":"market1"}
			});
		}
/* 
		console.log(output2);
		var sell = 0;
		_.forEach(output2.fills, function(value) {
			sell = sell + (value.price * value.qty);
		});
		
		console.log("Profit:" + (sell - buy)); */
	}
}