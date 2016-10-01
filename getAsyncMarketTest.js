var getAllMarketDataSync = require('./functions.js').getAllMarketDataSync;

(function repeat(){
	getAllMarketDataSync('0005', function(data){
		console.log(data);
		repeat();
	});
})();

