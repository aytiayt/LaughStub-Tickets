



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
	
	// onDeviceReady();
	
});


$(function() {
	
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






var loadUpcomingShows = function() {

	var apiData = {
		lat: appSettings.currLat,
		long: appSettings.currLong,
		brandProperty: appSettings.brandProperty
	};
	
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
	
	$.getJSON(apiCallURL('getArtist',apiData), function(data) {
		
		if(data.SUCCESS) {
			$('#artistDisplay').html(data.HTML).trigger("create");
			$.mobile.changePage($('#artistPage'));
		}
		
		$.mobile.hidePageLoadingMsg();
		
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



