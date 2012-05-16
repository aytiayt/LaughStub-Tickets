



/* Application Variables */

var db;
var appSettings = {
		currLat: 0,
		currLong: 0,
		userID: 0,
		brandProperty: "LS",
		dataAPI: "http://www.ticketmob.com/components/iosAPI.cfc",
		online: navigator.onLine || false
	};




$(document).bind("mobileinit", function() {
	
    // Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.useFastClick = true;
	
});

document.addEventListener("deviceready", onDeviceReady, false);

$(document).bind("pageinit", function() {
	
	//onDeviceReady();
	
	
});


$(function() {
	
	loadPurchasePolicy();
	populateExpMo();
	// console.log(appSettings);

});




function onDeviceReady() {
	
	navigator.geolocation.getCurrentPosition(
		function(position) {
			appSettings.currLat = position.coords.latitude;
			appSettings.currLong = position.coords.longitude;
			loadUpcomingShows();
			//updateLocation(position.coords.latitude,position.coords.longitude);
		},
		function (error) {
			console.log('code: ' + error.code    + '\n' + 'message: ' + error.message + '\n');
		}
	);
	
	//navigator.network.isReachable('ticketmob.com', reachableCallback);
	
}

function reachableCallback(reachability) {
    // There is no consistency on the format of reachability
    var networkState = reachability.code || reachability;

    var states = {};
    states[NetworkStatus.NOT_REACHABLE]                      = 'No network connection';
    states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
    states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi connection';

    // console.log('Connection type: ' + states[networkState]);
	if(networkState != 0) { appSettings.online = true; }
}


/*
function onDeviceReady() {
	createDB();
}
function createDB() {  
	db = window.openDatabase("LaughStubTicketDB", "1.0", "LaughStub Tickets Local Data Storage", 200000);
	db.transaction(verifDB, dbEmpty, function(){});
}
function verifDB(tx) {
	tx.executeSql("SELECT currLat, currLong, userID FROM userOptions", [], dbNotEmpty, dbEmpty);
}
function dbEmpty(tx) {
	db.transaction(populateDB, errorCB, successCB);
}
function dbNotEmpty(tx, result){
	var userData = result.rows.item(0);
	appSettings.currLat = userData.currLat;
	appSettings.currLong = userData.currLong;
	appSettings.userID = userData.userID;
}
function populateDB(tx) {
	tx.executeSql("DROP TABLE IF EXISTS userOptions");
    tx.executeSql("CREATE TABLE IF NOT EXISTS userOptions (id INTEGER PRIMARY KEY AUTOINCREMENT, currLat FLOAT, currLong FLOAT, userID INTEGER)");
    tx.executeSql("INSERT INTO userOptions (currLat,currLong,userID) VALUES (0,0,0)");
}
function errorCB(error) {
	console.log(errorCB);
}
function successCB() {
	appSettings.currLat = 0;
	appSettings.currLong = 0;
	appSettings.userID = 0;
	getCurrentLocation();
};




var updateLocation = function(latitude,longitude) {
	db.transaction(
		function(tx){
			tx.executeSql(
				"UPDATE userOptions SET currLat=:latitude, currLong=:longitude", [latitude,longitude],
				function(){
					//Success
				},
				function(error){
					//Fail	
					console.log(error);
				}
			);
		}, 
		function(){
			// Fail
		},
		function(){
			//Success
		}
	);
	
}

*/


var updateTotal = function() {
	
	//Updates the subtotal shown on a ticket purchase page by looping through the rows of tickets and determining how many of each ticket is selected.
	
	var subTotal = 0;
	
	$('tr','#showTickets').each(function(i){
		var showTierID = $(this).attr('id').replace('tierRow_','');
		var ticketPrice = parseFloat($('#ticketPrice_'+showTierID).val());
		var ticketQty = parseInt($('#tierQty_'+showTierID).val());
		var ticketPrice = eval(ticketPrice*ticketQty);
		subTotal = eval(subTotal+ticketPrice);
	});
	
	$('span','#buyPageTotal').html(subTotal.toFixed(2));
	
}


var populateExpMo = function() {
	// Get the current year and add 10 years for the year dropdown
	var d = new Date();
	var currentYear = d.getFullYear();
	for (i=currentYear;i<=eval(currentYear+10);i++) {
		$('#expYr').append('<option value="'+i+'">'+i+'</option>');
	}
	
}


var updateCCName = function() {
	$('#cardName').val($('#firstName').val() + ' ' + $('#lastName').val());
}




var applyCoupon = function() {

	var apiData = {
		brandProperty: appSettings.brandProperty,
		showTimingID: $('#checkoutShowTimingID').val(),
		showTierList: $('#checkoutShowTierList').val(),
		couponCode: $('#couponCode').val()
	};
	
	$.mobile.showPageLoadingMsg();
	
	$.getJSON(apiCallURL('validateCoupon',apiData), function(data) {
	
		if(data.SUCCESS) {
			
			if(data.VALID) {
				
				$('#checkoutCouponID').val(data.COUPONID);
				updateCart($('#checkoutShowTimingID').val(),$('#checkoutShowTierIDList').val(),$('#checkoutShowTierQtyList').val());
			
			} else {
				
				$('#checkoutCouponID').val(0);
				$('#couponCode').val('');
				checkoutAlert('Invalid Coupon!');
				
				$.mobile.hidePageLoadingMsg();
			}
			
		}
		
	});

}

var removeCoupon = function() {
	
	$('#checkoutCouponID').val(0);
	updateCart($('#checkoutShowTimingID').val(),$('#checkoutShowTierIDList').val(),$('#checkoutShowTierQtyList').val());
	
}



var checkoutAlert = function(msg) {
	
	$('#shoppingCart').prepend('<div class="ui-body ui-body-e messageBox" id="checkoutMessage"><p>'+msg+'</p></div>');
	window.setTimeout(function(){
		$('#checkoutMessage').fadeOut(500,function(){
			$(this).remove();
		});
	},5000);
	
}


var addToCart = function() {

	// Make sure there are some tickets selected
	var showTierIDArr = new Array();
	var showTierQtyArr = new Array();
	
	$('tr','#showTickets').each(function(i){
		var showTierID = $(this).attr('id').replace('tierRow_','');
		var ticketQty = parseInt($('#tierQty_'+showTierID).val());
		if(ticketQty>0){
			showTierIDArr.push(showTierID);
			showTierQtyArr.push(ticketQty);
		}
	});
	
	if(showTierIDArr.length==0) {
		// No tickets selected
		alert('Please select a valid quantity of tickets to purchase.');	
		
	} else {
		
		updateCart($('#showTimingID').val(),showTierIDArr.join(),showTierQtyArr.join());
		
	}
	
}

var updateCart = function(showTimingID,showTierIDList,showTierQtyList) {
	
	var apiData = {
		brandProperty: appSettings.brandProperty,
		showTimingID: showTimingID,
		showTierIDList: showTierIDList,
		showTierQtyList: showTierQtyList,
		couponID: $('#checkoutCouponID').val()
	};
	
	$.mobile.showPageLoadingMsg();
	
	$.getJSON(apiCallURL('shoppingCart',apiData), function(data) {
	
		if(data.SUCCESS) {
			
			$('#checkoutShowTierList').val(data.SHOWTIERLIST);
			$('#checkoutShowTierIDList').val(data.SHOWTIERIDLIST);
			$('#checkoutShowTierQtyList').val(data.SHOWTIERQTYLIST);
			$('#checkoutShowTimingID').val(data.SHOWTIMINGID);
			$('#checkoutCouponID').val(data.COUPONID);
			$('#checkoutTotal').val(data.TOTAL);
			
			$('#shoppingCart').html(data.CARTDISPLAY).trigger("create");
			
			$.mobile.changePage($('#cartPage'));
			
		}
		
		$.mobile.hidePageLoadingMsg();
		
	});
	
}



var loadUpcomingShows = function() {

	var apiData = {
		lat: appSettings.currLat,
		long: appSettings.currLong,
		brandProperty: appSettings.brandProperty
	};
	
	$.mobile.showPageLoadingMsg();
	
	$.getJSON(apiCallURL('topLocalShows',apiData), function(data) {
		
		if(data.SUCCESS) {
			$('#upcomingShows').html(data.HTML).trigger("create");
		}
		
		$.mobile.hidePageLoadingMsg();
		
	});
	
}


var displayShow = function(showTimingID) {
	
	var apiData = {
		showTimingID: showTimingID,
		brandProperty: appSettings.brandProperty
	};
	
	$.mobile.showPageLoadingMsg();
	
	$.getJSON(apiCallURL('getShow',apiData), function(data) {
		
		if(data.SUCCESS) {
			$('#showDisplay').html(data.HTML).trigger('create');
			$.mobile.changePage($('#showPage'));
		}
		
		$.mobile.hidePageLoadingMsg();
		
	});
	
}


var displayVenue = function(venueID) {
	
	var apiData = {
		venueID: venueID,
		brandProperty: appSettings.brandProperty
	};
	
	$.mobile.showPageLoadingMsg();
	
	$.getJSON(apiCallURL('getVenue',apiData), function(data) {
		
		if(data.SUCCESS) {
			$('#venueDisplay').html(data.HTML).trigger("create");
			$.mobile.changePage($('#venuePage'));
		}
		
		$.mobile.hidePageLoadingMsg();
		
	});
	
}


var displayArtist = function(artistID) {
	
	var apiData = {
		artistID: artistID,
		brandProperty: appSettings.brandProperty
	};
	
	$.mobile.showPageLoadingMsg();
	
	$.getJSON(apiCallURL('getArtist',apiData), function(data) {
		
		if(data.SUCCESS) {
			$('#artistDisplay').html(data.HTML).trigger("create");
			$.mobile.changePage($('#artistPage'));
		}
		
		$.mobile.hidePageLoadingMsg();
		
	});
	
}


var loadPurchasePolicy = function(artistID) {
	
	var apiData = {
		brandProperty: appSettings.brandProperty
	};
	
	$.getJSON(apiCallURL('purchasePolicy',apiData), function(data) {
		
		if(data.SUCCESS) {
			$('#purchasePolicyContent').html(data.HTML);
		}
		
	});
	
}


var apiCallURL = function(method,data) {
	
	var queryString = "";
	
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			queryString = queryString + '&' + key + '=' + data[key];
		}
	}
	
	return appSettings.dataAPI+'?method='+method+queryString+'&callback=?';
}



