var http = require('http');
var _ = require('lodash');

var necessaryFunctions = new Object();
var syncRequest = require('sync-request');

const TEAM_UID = "TtH8CwcTEcwcpP7BOoZBzg";

necessaryFunctions.requestToApi = function(apiFunctions){
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
};

necessaryFunctions.getMax= function(exchangeDataForSymbol){
    var max1 = Number.MIN_VALUE; var max2 = Number.MIN_VALUE; 
    var qty1; var qty2;
    _.forEach(exchangeDataForSymbol, function(eachExchangeData){
        _.forEach(eachExchangeData.buy, function(val, key){
            key = parseFloat(key);
            val = parseFloat(val);
            if(key >= max1){
                max2 = max1;
                qty2 = qty1;
                max1 = key;
                qty1 = val;
            } else if (key>= max2){
                max2 = key;
                qty2 = val;
            }
        });

    });
    var data = {
            'buy':{
                "price1": max1,
                "qty1": qty1,
                "price2": max2,
                "qty2": qty2
            }
    };
    return data;
}

necessaryFunctions.getMin= function(exchangeDataForSymbol){
    var min1 = Number.MAX_VALUE; var min2 = Number.MAX_VALUE; 
    var qty1; var qty2;
    _.forEach(exchangeDataForSymbol, function(eachExchangeData){
        _.forEach(eachExchangeData.buy, function(val, key){
            key = parseFloat(key);
            val = parseFloat(val);
            if(key <= min1){
                min2 = min1;
                qty2 = qty1;
                min1 = key;
                qty1 = val;
            } else if (key<= min2){
                min2 = key;
                qty2 = val;
            }
        });
    });
};

necessaryFunctions.sellStock = function(exchange, symbol, qty, type){
    var output = requestToApi({
                    'apiCall':'orders',
                    'symbol': symbol,
                    'exchange': 'exchange'+exchange,
                    'orderTicket': {"side": "sell",
                                    "qty":qty,
                                    "order_type":type}
                });
}

necessaryFunctions.buyStock = function(exchange, symbol, qty, type){
    var output = requestToApi({
                'apiCall':'orders',
                'symbol': symbol,
                'exchange': 'exchange'+exchangeOfMin,
                'orderTicket': {"side": "buy",
                                "qty":quantity,
                                "order_type":"market"}
            });
};

necessaryFunctions.getMinAsync = function (exchangeData, callback) {
    var min1 = Number.MAX_VALUE;
    var qty1;
    
    _.forEach(exchangeData.buy, function (val, key) {
        key = parseFloat(key);
        val = parseFloat(val);
        if (key <= min1) {
            min1 = key;
            qty1 = val;
        }
    });
    var data = {
        'buy': {
            "price1": min1,
            "qty1": qty1,
        },
        'exchange': exchangeData.exchange
    };
    callback(data);
}

necessaryFunctions.getMinSync = function(exchangeData, callback){
    var stockData = [];
    _.forEach(exchangeData, function(eachExchangeData){
        necessaryFunctions.getMinAsync(eachExchangeData, function(data){
            // console.log("On exchange: "+ data.exchange);
            stockData.push(data);
            if(stockData.length == 3) return callback(stockData);
        });
    });
}

necessaryFunctions.getMaxAsync = function (exchangeData, callback) {
    var max1 = Number.MIN_VALUE; 
    var qty1;
    _.forEach(exchangeData.sell, function (val, key) {
        key = parseFloat(key);
        val = parseFloat(val);
        if (key >= max1) {
            max1 = key;
            qty1 = val;
        }
    });
    var data = {
        'sell': {
            "price1": max1,
            "qty1": qty1,
        },
        'exchange': exchangeData.exchange
    };
    callback(data);
}

necessaryFunctions.getMaxSync = function(exchangeData, callback){
    var stockData = [];
    _.forEach(exchangeData, function(eachExchangeData){
        necessaryFunctions.getMaxAsync(eachExchangeData, function(data){
            // console.log("On exchange: "+ data.exchange);
            stockData.push(data);
            if(stockData.length == 3) return callback(stockData);
        });
    });
}

necessaryFunctions.getMarketDataAsync = function(exchange, symbol, callback){
    var options = {
        'host': 'cis2016-exchange'+exchange+'.herokuapp.com',
        'path': '/api/market_data/'+symbol,
    };


    var httpCallback = function(response){
        var data='';
        response.on('data', function(chunk){
            data+= chunk;
        });
        response.on('end', function(){
            data = JSON.parse(data);
            data.exchange = exchange;
            callback(data);
        });
    };

    http.get(options, httpCallback).end();
}

necessaryFunctions.getAllMarketDataSync =function(symbol, callback) {
    var stockData = [];
    for(var i = 1; i< 4; i++){
        necessaryFunctions.getMarketDataAsync(i, symbol, function(data){
            // console.log("On exchange: "+ data.exchange);
            stockData.push(data);
            if(stockData.length == 3) return callback(stockData);
        });
    }
};

module.exports =  necessaryFunctions;