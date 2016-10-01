var http = require('http');
var unirest = require('unirest');

var port = 8080;
var host = 'localhost';
var TEAM_ID = 'PkkYempGWJeQr3AFYzcOWA';


var options = {
	host: 'cis2016-exchange2.herokuapp.com',
	path: '/api/market_data'
};

callback = function(response){
	var data ='';
	response.on('data', function(part){
		data+= part;
	});

	response.on('end', function(){
		var total_amount = 5000;
		data = JSON.parse(data);
		var hash = new Object();
		var sum= 0;
		for (var i = 0; i< data.length; i++){
			var d = data[i];
			if (d.symbol != '0005') continue;
			if (d.bid == 0) continue;
			var returnP = (d.ask - d.bid)/(d.bid);
			if (returnP < 0 ) continue;
			sum+=returnP;
			hash[d.symbol] = returnP;
		}

		console.log(hash);
		for (var i =0; i< data.length; i++){
			var d = data[i];
			var amountToBuy = parseInt((hash[d.symbol]/sum) * total_amount);

			var buyData = {
				"team_uid": TEAM_ID,
				"symbol": d.symbol,
				"side": "buy",
				"qty": amountToBuy,
				"order_type": "market"
			};

			var options = {
				hostname: 'cis2016-exchange1.herokuapp.com',
				path: '/api/orders/',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			};

			var buyRequest = http.request(options, function(res){
				var response = '';
				res.on('data', function(chunk){
					response+=chunk;
				})
				res.on('end', function(){
					response = JSON.parse(response);
					console.log("After buy request sent\n");
					console.log(response);
					console.log("\n");					
				});
			});


			//send the buy body
			buyRequest.write(JSON.stringify(buyData));
			buyRequest.end();
			//////////////////////////////////////////////////////////////////////
			var buyRequest = unirest.post('http://cis2016-exchange1.herokuapp.com/api/orders/')
			.headers({'Content-Type': 'application/json'})
			.send(buyData)
			.end(function(res){
				if (res.body.status == 'FILLED' || res.body.status == 'PARTIAL_FILLED'){

					var sellStockData = {
						"team_uid": TEAM_ID,
						"symbol": res.body.symbol,
						"side": "sell",
						"qty": res.body.filled_qty,
						"order_type": "market"
					};
					var buyRequest = unirest.post('http://cis2016-exchange1.herokuapp.com/api/orders/')
					.headers({'Content-Type': 'application/json'})
					.send(sellStockData)
					.end(function(res){
						console.log(res.body);
					});
				}
			});
				


		

		}

		console.log(hash);
	})
};

for (var tradeCount = 0; tradeCount< 5; tradeCount++){
	console.log("tradeCount: "+ tradeCount+"\n");
	http.get(options, callback);	
}
