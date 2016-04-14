
var $dom = $( "#maincontainer" );

var json;

// e.g. to_date("28-Jul-2015") and then toLocaleDateString() to get back
function to_date(x){
  return new Date(x.substring(0,4), x.substring(5,7)-1, x.substring(8,10), x.substring(11,13), x.substring(14,16), x.substring(17,19));
}

// pad number with leading zeros
function pad(num, size){ return ('000000000' + num).substr(-size); }


$.getJSON("./data/processed_rescued_vessels.json", function(d) {
	dd = d.slice(0);
	// datify relevant fields
	if(d.length > 0){
		var datefields = ['SURVEY_START_TIME','SURVEY_END_TIME','DETAILS_TODAY'];
		var headers = Object.keys(d[0]);
		for(var i=0; i<d.length; i++) for(var j=0; j<headers.length; j++) {
			if(datefields.indexOf(headers[j]) > -1) d[i][headers[j]] = to_date(d[i][headers[j]]);
		}
		json = d;

		$('#maincontainer').append("<div class='table_container' style='font: 12px sans-serif;'><div class='row'><div class='span12'><table class='table table-hover' id='dc-table-graph'><thead><tr class='header'><th class='data-table-col' data-col='SURVEY_END_TIME'>Submitted</th><th class='data-table-col' data-col='eventid'>Event ID</th><th class='data-table-col' data-col='lat'>Latitude</th><th class='data-table-col' data-col='lon'>Longitude</th><th class='data-table-col' data-col='country'>Country of departure</th><th class='data-table-col' data-col='boat'>Vessel structure</th></tr></thead></table></div></div></div>");

		json.forEach(function(x) {
			x['date'] = x['SURVEY_END_TIME'].getUTCFullYear() + '-' + pad(x['SURVEY_END_TIME'].getUTCMonth()+1,2) + '-' + pad(x['SURVEY_END_TIME'].getUTCDate(),2);
			x['eventid'] = +x['DETAILS_RESCUE_NUMBER'];
			x['lat'] = +x['LOCATION_LAT'];
			x['lon'] = +x['LOCATION_LNG'];
			x['country'] = x['DETAILS_DEPARTURE_COUNTRY'];
			x['boat'] = x['DETAILS_BOAT_STRUCTURE'];
		});

		// main function
		summarise();
	}
});


// REPORTING FUNCTIONS

function summarise(){

	var cf = crossfilter(json);
	
	//---------------------------------------------------------------------------
	// DATE HISTOGRAM

	var dateDimension = cf.dimension(function(d) {return d.date;});

	//---------------------------------------------------------------------------
	// DATA TABLE

	//var dataDim = cf.dateDimension(function(d) {return d['SURVEY_END_TIME'];});
	var dataTable = dc.dataTable("#dc-table-graph")
	
	dataTable
	.dimension(dateDimension)
	.group(function (d) { return ''; })
	//.ordering(function(d) { return -d.value; })
	.sortBy(function(d) { return -d['SURVEY_END_TIME']; })
	.size(650)
	.columns([
		function(d){ return d.date; },
		function(d){ return d.eventid; },
		function(d){ return d.lat; },
		function(d){ return d.lon; },
		function(d){ return d.country; },
		function(d){ return d.boat; }
	])

	//---------------------------------------------------------------------------
	
	dc.renderAll();

	// reorder table when click on header
	// $('#dc-table-graph').on('click', '.data-table-col', function() {
	// 	var column = $(this).attr("data-col");
	// 	dataDim.dispose();
	// 	dataDim = cf.dimension(function(d) {return d[column]; });
	// 	dataTable.dimension(dataDim)
	// 	dataTable.sortBy(function(d) { return d[column]; });
	// 	dataTable.redraw();
	// });

}
