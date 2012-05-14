





$(document).bind("mobileinit", function() {
	
    // Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.useFastClick = true;
	
});



var db;
var appSettings = {
		currLat: 0,
		currLong: 0,
		userID: 0,
		brandProperty: "LS",
		dataAPI: "http://www.ticketmob.com/components/iosAPI.cfc"
	};

document.addEventListener("deviceready", onDeviceReady, false);
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
	locationLoad();
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







$(document).bind("pageinit", function() {
	
	
	
});


$(function() {
	
	// onDeviceReady();

});




var getCurrentLocation = function() {
	navigator.geolocation.getCurrentPosition(
		function(position) {
			appSettings.currLat = position.coords.latitude;
			appSettings.currLong = position.coords.longitude;
			updateLocation(position.coords.latitude,position.coords.longitude);
			/*
			Latitude: 			position.coords.latitude          
			Longitude:        	position.coords.longitude         
			Altitude:        	position.coords.altitude          
			Accuracy:       	position.coords.accuracy          
			Altitude Accuracy:	position.coords.altitudeAccuracy  
			Heading:         	position.coords.heading          
			Speed:           	position.coords.speed            
			Timestamp:			new Date(position.timestamp)     
			*/
			
			locationLoad();
		},
		function (error) {
			console.log('code: ' + error.code    + '\n' + 'message: ' + error.message + '\n');
		}
	);
}

var locationLoad = function() {
	
	// Called after location succesfully set
	$.mobile.changePage($("#upcomingPage"));
	loadUpcomingShows();

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

var apiCallURL = function(method,data) {
	
	var queryString = "";
	
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			queryString = queryString + '&' + key + '=' + data[key];
		}
	}
	
	return appSettings.dataAPI+'?method='+method+queryString+'&callback=?';
}



