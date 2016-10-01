var getAllMarketDataSync = require('./functions.js').getAllMarketDataSync;

getAllMarketDataSync('0005', function(data){
	console.log(data);
})