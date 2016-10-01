var http = require('http');
var unirest = require('unirest');

var port = 8080;
var host = 'localhost';
var TEAM_ID = 'PkkYempGWJeQr3AFYzcOWA';

var exchangeNum =1;
var hash = new Object();



var options = {
	host: 'cis2016-exchange'+exchangeNum+'.herokuapp.com',
	path: '/api/market_data'
};

var callback = function(res){
	var data = ''
	res.on('data', function(chunk){
		data+= chunk;
	});
	res.on('end', function(){
		data = JSON.parse(data);
		for(var k = 0; k<data.length; k++){
			var element = data[k];
			if (hash[element.symbol] == undefined){
				hash[element.]
			}
		}
	})
}