



/* Set up some global variables in a jQuery object */
$.appSettings = {};
$.appSettings.currLat = 0;
$.appSettings.currLong = 0;
$.appSettings.brandProperty = "LS";


$(document).bind("mobileinit", function() {
	
    // Make your jQuery Mobile framework configuration changes here!
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.useFastClick = true;
	
});



$(document).bind("pageinit", function() {
	
	if($.appSettings.currLat == 0 && $.appSettings.currLong == 0) {
		$.mobile.changePage($("#locationPage"));
		getCurrentLocation();
	}
	
});


var getCurrentLocation = function() {
	navigator.geolocation.getCurrentPosition(
		function(position) {
			$.appSettings.currLat = position.coords.latitude;
			$.appSettings.currLong = position.coords.longitude;
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


var locationLoad = function(position) {
	
	// Called after location succesfully set
	$.mobile.changePage($("#upcomingPage"));
	loadUpcomingShows();
}

var loadUpcomingShows = function() {

	$.mobile.showPageLoadingMsg();
	
	var queryString = 'method=topLocalShows';
		queryString = queryString + '&lat='+$.appSettings.currLat;
		queryString = queryString + '&long='+$.appSettings.currLong;
		queryString = queryString + '&brandProperty='+$.appSettings.brandProperty;
		queryString = queryString + '&callback=?';

	var surl = 'http://www.ticketmob.com/components/iosAPI.cfc?'+queryString;

	$.getJSON(surl, function(data) {
		
		if(data.SUCCESS) {
			$('#upcomingShows').html(data.HTML).trigger("create");
		}
		
		$.mobile.hidePageLoadingMsg();
		
	});
	
}

