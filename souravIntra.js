var _ = require('lodash');
var http = require('http');
var syncRequest = require('sync-request');

callback = function(response){
    // Continuously update stream with data
    console.log("Test", response);
}

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




function getMin(exchangeDataForSymbol){
	var excTwoHiLos = [];
	_.forEach(exchangeDataForSymbol, function(eachExchangeData){
		var min1 = Number.MAX_VALUE; var min2 = Number.MAX_VALUE; 
		var qty1; var qty2;
		_.forEach(eachExchangeData.buy, function(val, key){
			key = parseFloat(key);
			val = parseFloat(val);
			if(key <= min1){
				min2 = min1;
				qty2 = qty1;
				min1 = key;
				qty1 = val;
			}
		});

		min1 = min1.toString();
		min2 = min2.toString();
		var data = {
			'buy':{
				"min1": min1,
				"qty1": qty1,
				"min2": min2,
				"qty2": qty2
			}
		};
		excTwoHiLos.push(data);
	});
	return excTwoHiLos;
}

while(true){
var stockJSONex1 = requestToApi({
	'apiCall':'market_data',
	'symbol': '0386',
	'exchange': 'exchange1'
});

var stockJSONex2 = requestToApi({
	'apiCall':'market_data',
	'symbol': '0386',
	'exchange': 'exchange2'
});

var stockJSONex3 = requestToApi({
	'apiCall':'market_data',
	'symbol': '0386',
	'exchange': 'exchange3'
});


var stockData = [stockJSONex1, stockJSONex2, stockJSONex3];


console.log(getMin(stockData));
return;

//console.log("Session: %j", _.toPairs(stockJSONex1.buy));
//console.log(stockData);

var minPrice = 10000000;
var exchangeOfMin = 4;

var i = 1;
_.forEach(stockData, function(value) {
	//console.log("Sell: %j\n", value.sell);
	var min = 10000000;
	_.forEach(value.sell, function(key, val){
		if(val < min){
			min = val;
		}
	});
	
	if(min < minPrice){
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
		if(val > max){
			max = val;
		}
	});
	
	if(max > maxPrice){
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

console.log("Buy "+quantity+ " from exchange "+ exchangeOfMin +" and sell to " + exchangeOfMax);
console.log("Buy "+minPrice+ " from exchange "+ exchangeOfMin +" and sell at " + maxPrice);

// var output = requestToApi({
//         'apiCall':'orders',
//         'symbol': '0005',
//         'exchange': 'exchange'+exchangeOfMin,
//         'orderTicket': {"side": "buy",
//                         "qty":quantity,
//                         "order_type":"market"}
//     });

//     console.log(output);
	
// 	var output2 = requestToApi({
//         'apiCall':'orders',
//         'symbol': '0005',
//         'exchange': 'exchange'+exchangeOfMax,
//         'orderTicket': {"side": "sell",
//                         "qty":quantity,
//                         "order_type":"market"}
//     });

    // console.log(output2);
}

