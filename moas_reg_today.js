
var $dom = $( "#maincontainer" );

var json = {},
	vulner_json,
	people_data = false,
	vulner_data = false,
	dd;

// function to count records in current filter
function sum_filter(){
	var sum = 0;
	var arr = countGroup.all();
	for (var i=0; i<arr.length; i++) {
		sum += arr[i].value;
	}
	return sum;
}

// replace filename chars '.' with '_' - for some reason Briefcase changes these
function replace_all(str, find, replace){ return str.replace(new RegExp(find, 'g'), replace) ;}

// date/time stuff
// var mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// function month(m){ return mons[+m-1] ;}

// e.g. to_date("28-Jul-2015") and then toLocaleDateString() to get back
function to_date(x){
  return new Date(x.substring(0,4), x.substring(5,7)-1, x.substring(8,10), x.substring(11,13), x.substring(14,16), x.substring(17,19));
}

// pad number with leading zeros
function pad(num, size){ return ('000000000' + num).substr(-size); }

var age = {"<1": "Less than 1 year", "1-4": "1-4 years", "5-12": "5-12 years", "13-17": "13-17 years", "18-34": "18-34 years", "35-49": "35-49 years", "50+": "50+ years"};
var vul = {"": "", "VISABLY_DISABLED": "Visibly disabled", "INJURED": "Injured", "ILL": "Acute illness", "UNACCOMPANIED_MINOR": "Unaccompanied minor", "PREGNANT": "Pregnant", "SINGLE_FEMALE": "A single female traveller"};

$.getJSON("./data/processed_rescued_people.json", function(d) {
	dd = d.slice(0);
	// datify relevant fields
	if(d.length > 0){
		var datefields = ['SURVEY_START_TIME','SURVEY_END_TIME','DETAILS_TODAY'];
		var headers = Object.keys(d[0]);
		for(var i=0; i<d.length; i++) for(var j=0; j<headers.length; j++) {
			if(datefields.indexOf(headers[j]) > -1) d[i][headers[j]] = to_date(d[i][headers[j]]);
		}
		people_data = true;
		json = d;
		data_in();
	}
});

$.getJSON("./data/processed_vulnerabilities.json", function(d) {
	if(d.length > 0){
		vulner_data = true;
		vulner_json = d;
		data_in();
	}
});

function data_in(){
	if(people_data && vulner_data){
		// append DOM elements
		$('#datechart').append('<h4>Date</h4>');
		$('#eventchart').append('<h4>Event number (that day)</h4>');
		$('#agechart').append('<h4>Age</h4>');
		$('#natchart').append('<h4>Nationality</h4>');
		$('#sexchart').append('<h4>Gender</h4>');
		$('#vulchart').append('<h4>Vulnerability</h4>');
		$('#maincontainer').append("<div class='table_container' style='font: 12px sans-serif;'><div class='row'><div class='span12'><table class='table table-hover' id='dc-table-graph'><thead><tr class='header'><th class='data-table-col' data-col='SURVEY_END_TIME'>Submitted</th><th class='data-table-col' data-col='gender'>Gender</th><th class='data-table-col' data-col='age'>Age</th><th class='data-table-col' data-col='country'>Nationality</th><th class='data-table-col' data-col='vuln_str'>Vulnerability</th></tr></thead></table></div></div></div>");

		// combine json files
		var uids = [];
		for(var i=0; i<json.length; i++){
			json[i].vuln_arr = [];
			json[i].vuln_str = '';
			uids.push( json[i]._URI );
		}

		for(var i=0; i<vulner_json.length; i++){
			var ind = uids.indexOf( vulner_json[i]._PARENT_AURI );
			if(ind > -1) json[ind].vuln_arr.push( vul[vulner_json[i].VALUE] );
		}

		for(var i=0; i<json.length; i++) json[i].vuln_str = json[i].vuln_arr.join('; ');

		json.forEach(function(x) {
			x['country'] = x['DETAILS_ORIGIN_COUNTRY'];
			x['gender'] = x['DETAILS_PATIENT_GENDER'];
			x['age'] = x['DETAILS_PATIENT_AGE'];
			x['date'] = x['SURVEY_END_TIME'].getUTCFullYear() + '-' + pad(x['SURVEY_END_TIME'].getUTCMonth()+1,2) + '-' + pad(x['SURVEY_END_TIME'].getUTCDate(),2);
		});

		// filter to today's data
		round_date = function(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
		today = round_date( new Date(Date()) );
		
		json = json.filter(function (elem) {
			return round_date(elem.DETAILS_TODAY).getTime() === today.getTime();
		});

		// main function
		summarise(json);
	}
}

// REPORTING FUNCTIONS

function summarise(){

	var cf = crossfilter(json);
	
	var w = $('#sexchart').width();

	// COUNT DIMENSION (FOR FILTER COUNT)
	var count_chart = dc.barChart("#countchart");
		countDimension = cf.dimension(function(d) {return d.date;});
		countGroup = countDimension.group();
	count_chart.dimension(countDimension)
		.group(countGroup)
		.x(d3.scale.ordinal().domain( countGroup.order() ));

	//---------------------------------------------------------------------------
	// DATE HISTOGRAM

	var date_chart = dc.barChart("#datechart");
		dateDimension = cf.dimension(function(d) {return d.date;});
	dateCountGroup = dateDimension.group();

	date_chart
	.dimension(dateDimension)
	.group(dateCountGroup)
	.x(d3.scale.ordinal().domain( dateCountGroup.order() ))
	//.x(d3.scale.linear().domain( dateCountGroup.order() ))
	.xUnits(dc.units.ordinal)
	.width($('#datechart').width())
	.margins({ top: 10, left: 30, right: 10, bottom: 80 })
	.height(Math.max(200, w*.5))
	.brushOn(false)
	//.elasticY(true)
	.yAxisLabel("Count")
	// .on('renderlet', function(chart) {
	// 	chart.selectAll('rect').on("click", function(d) {
	// 		console.log("click!", d);
	// 	});
	// })
	.yAxis().ticks(5);

	date_chart.on("renderlet", function(d){
		var gLabelsData = date_chart.select(".chart-body")
			.selectAll("text.selection_total").data(date_chart.selectAll(".bar")[0]);
		gLabelsData.exit().remove(); //Remove unused elements
		gLabelsData.enter().append("text") //Add new elements
		gLabelsData
			.attr('text-anchor', 'middle')
			.attr('fill', 'black')
			.attr("class", "selection_total")
			.text(function(d){
				console.log(d3.select(d).data()[0]);
				console.log(d.getAttribute('x') );
				return d3.select(d).data()[0].data.value
			})
			.attr('x', function(d){ return +d.getAttribute('x') + (d.getAttribute('width')/2); })
			.attr('y', function(d){ return +d.getAttribute('y') + 15; })
	});

	//---------------------------------------------------------------------------
	// EVENT CHART

	var event_chart = dc.rowChart("#eventchart"),
		eventDimension  = cf.dimension(function(d) { return +d["DETAILS_TRIP_NUMBER"]; }),
		eventCountGroup = eventDimension.group();

	event_chart
	.width($('#eventchart').width())
	.height(Math.max(200, w*.5))
	.ordering(function(d) { return -d.value; })
	.dimension(eventDimension)
	.group(eventCountGroup)
	.colors(['#1f77b4'])
	.colorDomain([0,1])
	.colorAccessor(function(d,i){ return i; })
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	})
	.xAxis().ticks(5);;


	//---------------------------------------------------------------------------
	// AGE HISTOGRAM

	var age_chart = dc.barChart("#agechart"),
		ageDimension        = cf.dimension(function(d) {return d.age;}),
		ageCountGroup       = ageDimension.group();

	age_chart
	.width($('#agechart').width())
	.height(Math.max(180, w*.5))
	.x(d3.scale.ordinal().domain(["<1","1-4","5-12","13-17","18-34","35-49","50+"])) 
	.xUnits(dc.units.ordinal)
	.margins({ top: 10, left: 30, right: 10, bottom: 40 })
	.brushOn(false)
	.yAxisLabel("Frequency")
	.dimension(ageDimension)
	.group(ageCountGroup)
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	})
	.yAxis().ticks(5);


	//---------------------------------------------------------------------------
	// GENDER PIE

	var sex_chart = dc.pieChart("#sexchart"),
		sexDimension  = cf.dimension(function(d) {return d.gender;}),
		sexCountGroup = sexDimension.group();

	sex_chart
	.dimension(sexDimension)
	.group(sexCountGroup)
	.width(w)
	.height(Math.max(120, w*.6))
	.slicesCap(4)
	.innerRadius(w/9);
	//.legend(dc.legend());


	//---------------------------------------------------------------------------
	// NATIONALITY CHART

	var nat_chart = dc.rowChart("#natchart"),
		natDimension  = cf.dimension(function(d) { return d.country; }),
		natCountGroup = natDimension.group();

	nat_chart
	.rowsCap(12)
	.width($('#natchart').width())
	.height(Math.max(350, w*.7))
	.ordering(function(d) { return -d.value; })
	.dimension(natDimension)
	.group(natCountGroup)
	.colors(['#1f77b4'])
	.colorDomain([0,1])
	.colorAccessor(function(d,i){ return i; })
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	})
	.xAxis().ticks(3);;


	//---------------------------------------------------------------------------
	// VULNERABILITY CHART

	function remove_empty_bins(source_group) {
		function non_zero_pred(d) { return d.key != '';}
		return {
			all: function () {
				return source_group.all().filter(non_zero_pred);
			},
			top: function(n) {
				return source_group.top(Infinity)
				.filter(non_zero_pred)
				.slice(0, n);
			}
		};
	}

	// 3 functions for grouping sub-arrays (https://jsfiddle.net/geotheory/ku9qd1Lx/)
	function reduceAdd(p, v) {
	  v.vuln_arr.forEach (function(val, idx) {
	     p[val] = (p[val] || 0) + 1; //increment counts
	  });
	  return p;
	}

	function reduceRemove(p, v) {
	  v.vuln_arr.forEach (function(val, idx) {
	     p[val] = (p[val] || 0) - 1; //decrement counts
	  });
	  return p; 
	}

	function reduceInitial() { return {}; }


	var vulnerabilities = cf.dimension(function(d){ return d.vuln_arr ;});
	var vulnGroup = vulnerabilities.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();
	var vulnGroup_filtered = remove_empty_bins(vulnGroup)

	// hack to make dc.js charts work
	vulnGroup.all = function() {
	  var newObject = [];
	  for (var key in this) {
	    if (this.hasOwnProperty(key) && key != "all") {
	      newObject.push({
	        key: key,
	        value: this[key]
	      });
	    }
	  }
	  return newObject;
	}


	var vulnerability_chart = dc.rowChart("#vulchart");

	vulnerability_chart
	.dimension(vulnerabilities)
	.group(vulnGroup_filtered)
	.filterHandler (function (dimension, filters) {
		dimension.filter(null);   
		if (filters.length === 0) dimension.filter(null);
		else dimension.filterFunction(function (d) {
			for (var i=0; i < d.length; i++) {
				if (filters.indexOf(d[i]) >= 0) return true;
			}
			return false;
		});
		return filters; 
	})
	.ordering(function(d) { return -d.value; })
	//.rowsCap(12)
	.width($('#vulchart').width())
	.height(Math.max(350, w*.7))
	.colors(['#1f77b4'])
	//.colorDomain([0,1])
	.colorAccessor(function(d, i){ return i; })
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	})
	.xAxis().ticks(5);


	//---------------------------------------------------------------------------
	// DATA TABLE

	var dataDim = cf.dimension(function(d) {return d['SURVEY_END_TIME'];});
	var dataTable = dc.dataTable("#dc-table-graph")
	
	dataTable
	.dimension(dateDimension)
	.group(function (d) { return ''; })
	//.ordering(function(d) { return -d.value; })
	.sortBy(function(d) { return -d['SURVEY_END_TIME']; })
	.size(650)
	.columns([
		function(d){ return d.date; },
		function(d){ return d.gender; },
		function(d){ return d.age; },
		function(d){ return d.country; },
		function(d){ return d.vuln_str; }
	])

	//---------------------------------------------------------------------------
	
	dc.renderAll();

	// reorder table when click on header
	$('#dc-table-graph').on('click', '.data-table-col', function() {
		var column = $(this).attr("data-col");
		dataDim.dispose();
		dataDim = cf.dimension(function(d) {return d[column];});
		dataTable.dimension(dataDim)
		dataTable.sortBy(function(d) { return d[column]; });
		dataTable.redraw();
	});

	// catch any click to update filter sum
	$(document).click(function() {
		//console.log(sum_filter());
		var count_msg = 'Selection count: ' + sum_filter();
		document.getElementById('filter_count').innerHTML=count_msg;
	});

}

