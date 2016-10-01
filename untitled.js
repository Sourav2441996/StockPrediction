
					var sellStockData = {
						"team_uid": TEAM_ID,
						"symbol": d.symbol,
						"side": "sell",
						"qty": amountToBuy,
						"order_type": "market"
					};

					var sellStockRequestOptions = {
						hostname: 'cis2016-exchange1.herokuapp.com',
						path: '/api/orders',
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						}
					};


					var sellRequest = unirest.post('http://cis2016-exchange1.herokuapp.com/api/orders/')
					.headers({"Content-Type"})
