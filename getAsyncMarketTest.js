var getAllFunctions = require('./functions.js');


var _ = require('lodash');
function example(callback){
		getAllFunctions.getAllMarketDataSync('0386', function(data){
		finalMinMax = [];
		getAllFunctions.getMinSync(data, function(data){
			// console.log("Buy", data);
			var test = _.minBy(data, function(o) { return 'o.buy.price1'; });
			finalMinMax.push(test);
		});
		getAllFunctions.getMaxSync(data, function(data){
			// console.log("Sell", data);
			var test = _.maxBy(data, function(o) { return 'o.buy.price1'; });
			finalMinMax.push(test);
		});
		callback(finalMinMax);
	});
}

var ro = example(function(res)
{	
	console.log("Test", res);
	return res;
})
