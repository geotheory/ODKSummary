
// read in JSON file

var forms, json, met, xx,
	root_val, root_txt;
var $dom = $( "#maincontainer" );


// replace filename chars '.' with '_' - for some reason Briefcase changes these
function replace_all(str, find, replace){ return str.replace(new RegExp(find, 'g'), replace) ;}

// date/time stuff
function month(M){for(var i=0; i<12; i++) if(M==['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]) return i;}

// e.g. to_date("28-Jul-2015") and then toLocaleDateString() to get back
function to_date(x){
  var mon = month(x.substring(3,6));
  if(x.length > 12) return new Date(x.substring(7,11), mon, x.substring(0,2), x.substring(12,14), x.substring(15,17), x.substring(18,20));
  else return new Date(x.substring(7,11), mon, x.substring(0,2));
}

// extract value array from cf object by field name
function get_array(cf_object, field){
  var d = cf_object.dimension(function(dat){return dat.total; }).top(cf_object.size());
  var arr = [];
  for(var i=0; i<cf_object.size(); i++) arr.push(d[i][field]);
  return arr;
}

// pad number with leading zeros
function pad(num, size){ return ('000000000' + num).substr(-size); }

// nationality & vulnerabilityidity codes
nats_in = [{"nat": "Afghanistan", "id": "AF"}, {"nat": "Algeria", "id": "DZ"}, {"nat": "Angola", "id": "AO"}, {"nat": "Benin", "id": "BJ"}, {"nat": "Botswana", "id": "BW"}, {"nat": "Burkina Faso", "id": "BF"}, {"nat": "Burundi", "id": "BI"}, {"nat": "Cabo Verde", "id": "CV"}, {"nat": "Cameroon", "id": "CM"}, {"nat": "Central African Republic", "id": "CF"}, {"nat": "Chad", "id": "TD"}, {"nat": "Comoros", "id": "KM"}, {"nat": "Congo (DRC)", "id": "CD"}, {"nat": "Congo (RO)", "id": "CG"}, {"nat": "Cote d'Ivoire", "id": "CI"}, {"nat": "Djibouti", "id": "DJ"}, {"nat": "Egypt", "id": "EG"}, {"nat": "Equatorial Guinea", "id": "GQ"}, {"nat": "Eritrea", "id": "ER"}, {"nat": "Ethiopia", "id": "ET"}, {"nat": "Gabon", "id": "GA"}, {"nat": "Gambia", "id": "GM"}, {"nat": "Ghana", "id": "GH"}, {"nat": "Guinea", "id": "GN"}, {"nat": "Guinea-Bissau", "id": "GW"}, {"nat": "Iran", "id": "IR"}, {"nat": "Iraq", "id": "IQ"}, {"nat": "Jordan", "id": "JO"}, {"nat": "Kenya", "id": "KE"}, {"nat": "Lebanon", "id": "LB"}, {"nat": "Lesotho", "id": "LS"}, {"nat": "Liberia", "id": "LR"}, {"nat": "Libya", "id": "LY"}, {"nat": "Madagascar", "id": "MG"}, {"nat": "Malawi", "id": "MW"}, {"nat": "Mali", "id": "ML"}, {"nat": "Mauritania", "id": "MR"}, {"nat": "Mauritius", "id": "MU"}, {"nat": "Morocco", "id": "MA"}, {"nat": "Mozambique", "id": "MZ"}, {"nat": "Namibia", "id": "NA"}, {"nat": "Niger", "id": "NE"}, {"nat": "Nigeria", "id": "NG"}, {"nat": "Rwanda", "id": "RW"}, {"nat": "Sao Tome and Principe", "id": "ST"}, {"nat": "Senegal", "id": "SN"}, {"nat": "Sierra Leone", "id": "SL"}, {"nat": "Somalia", "id": "SO"}, {"nat": "South Africa", "id": "ZA"}, {"nat": "South Sudan", "id": "SS"}, {"nat": "Sudan", "id": "SD"}, {"nat": "Swaziland", "id": "SZ"}, {"nat": "Syria", "id": "SY"}, {"nat": "Tanzania", "id": "TZ"}, {"nat": "Togo", "id": "TG"}, {"nat": "Tunisia", "id": "TN"}, {"nat": "Uganda", "id": "UG"}, {"nat": "Yemen", "id": "YE"}, {"nat": "Zambia", "id": "ZM"}, {"nat": "Zimbabwe", "id": "ZW"}, {"nat": "Other", "id": "0"}];
var nat = {};
for(var i=0; i<nats_in.length; i++){ nat[nats_in[i].id] = nats_in[i].nat; }

var age = {"0": "<1", "1": "1-4", "2": "5-12", "3": "13-17", "4": "18-34", "5": "35-49", "6": "50+"};
var vul = {"0": "", "1": "Visibly disabled", "2": "Injured", "3": "Acute illness", "4": "Unaccompanied minor", "5": "Pregnant"};

$.getJSON("./data/MOAS_Registration_v_9_5.json", function(d) {
	// datify relevant fields
	if(d.length > 0){
		var datefields = ['Date','date','SubmissionDate','start','end'];
		var headers = Object.keys(d[0]);
		for(var i=0; i<d.length; i++) for(var j=0; j<headers.length; j++) {
			if(datefields.indexOf(headers[j]) > -1) d[i][headers[j]] = to_date(d[i][headers[j]]);
		}
	}
	
	// append DOM elements
	$('#datechart').append('<h4>Date</h4>');
	$('#eventchart').append('<h4>Event ID</h4>');
	$('#agechart').append('<h4>Age</h4>');
	$('#natchart').append('<h4>Nationality</h4>');
	$('#sexchart').append('<h4>Gender</h4>');
	$('#vulchart').append('<h4>vulnerability</h4>');
	$('#maincontainer').append("<div class='table_container' style='font: 12px sans-serif;'><div class='row'><div class='span12'><table class='table table-hover' id='dc-table-graph'><thead><tr class='header'><th>Date</th><th>Gender</th><th>Age</th><th>Nationality</th><th>vulnerability</th></tr></thead></table></div></div></div>");
	
	// call main function
	summarise(d);
});


// REPORTING FUNCTIONS

var j;

function summarise(json){
	// d0 = crossfilter(json); // permanent obj
	// d = crossfilter(json);  // working obj
	j = json;
	j.forEach(function(x) {
		x['pat_d-nat_ty'] = nat[x['pat_d-nat_ty']];
		x['pat_dt-sex'] = +x['pat_dt-sex'];
		x['age'] = ["<1","1-4","5-12","13-17","18-34","35-49","50+"][+x['pat_d-age_group']];
		if(x['pat_d-vuln_ty'] == ""){ x['pat_d-vuln_ty'] = '0'; };
		x['pat_d-vuln_ty'] = +x['pat_d-vuln_ty'];
		x['vulnerability'] = vul[ x['pat_d-vuln_ty'] ];
		x['date'] = x['end'].getUTCFullYear() + '-' + pad(x['end'].getUTCMonth(),2) + '-' + pad(x['end'].getUTCDate(),2);
		//if(x['vulnerability'] == "None") x['vulnerability'] = '';
	});

	var d = crossfilter(j);
	drawGraphs(d);
}


function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


function drawGraphs(d){

	var w = $('#sexchart').width();
	var ndx = d


	// DATE HISTOGRAM

	var date_chart = dc.barChart("#datechart");
	var dateDimension = ndx.dimension(function(d) {return d['date'];})
	  dateCountGroup = dateDimension.group();

	datesum = dateCountGroup.top(Infinity);
	datelst = [];
	for(var i=0; i< datesum.length; i++){ datelst.push(datesum[i].key);}

	date_chart
	.width($('#datechart').width())
	.height(Math.max(200, w*.5))
	.x(d3.scale.ordinal().domain( datelst.sort() ))
	//.x(d3.scale.linear().domain( datelst.sort() ))
	.xUnits(dc.units.ordinal)
	.brushOn(false)
	//.elasticY(true)
	.yAxisLabel("Count")
	.dimension(dateDimension)
	.group(dateCountGroup)
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	})
	.yAxis().ticks(5);;


	// EVENT CHART

	var event_chart = dc.rowChart("#eventchart");
	var eventDimension  = ndx.dimension(function(d) { return d['pat_d-rescue_no']; })
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


	// AGE HISTOGRAM

	var age_chart = dc.barChart("#agechart");
	var	ageDimension        = ndx.dimension(function(d) {return d["age"];}),
		ageCountGroup       = ageDimension.group();

	age_chart
	.width($('#agechart').width())
	.height(Math.max(180, w*.5))
	.x(d3.scale.ordinal().domain(["<1","1-4","5-12","13-17","18-34","35-49","50+"])) //"0": "<1", "1": "1-4", "2": "5-12", "3": "13-17", "4": "18-34", "5": "35-49", "6": "50+"
	.xUnits(dc.units.ordinal)
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


	// GENDER PIE

	var sex_chart = dc.pieChart("#sexchart");
	var sexDimension  = ndx.dimension(function(d) {return ['F','M'][d['pat_d-sex']];})
		sexCountGroup = sexDimension.group();

	sex_chart
	.width(w)
	.height(Math.max(120, w*.5))
	.slicesCap(4)
	.innerRadius(w/7)
	.dimension(sexDimension)
	.group(sexCountGroup)
	.legend(dc.legend());


	// NATIONALITY CHART

	var nat_chart = dc.rowChart("#natchart");
	var natDimension  = ndx.dimension(function(d) { return d['pat_d-nat_ty']; });
	var natCountGroup = natDimension.group();

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
	.xAxis().ticks(5);;


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

	var vulnerability_chart = dc.rowChart("#vulchart");
	var vulnerabilityDimension  = ndx.dimension(function(d) { 
		//console.log(d['vulnerability']);
		return d['vulnerability']; }),
		vulnerabilityCountGroup = vulnerabilityDimension.group();

	//xx = vulnerabilityCountGroup;
	var filteredvulnerabilityGroup = remove_empty_bins(vulnerabilityCountGroup);

	vulnerability_chart
	.rowsCap(12)

	.width($('#vulchart').width())
	.height(Math.max(350, w*.7))
	.ordering(function(d) { return -d.value; })
	.dimension(vulnerabilityDimension)
	.group(filteredvulnerabilityGroup)
	.colors(['#1f77b4'])
	//.colorDomain([0,1])
	.colorAccessor(function(d,i){ return i; })
	.on('renderlet', function(chart) {
		chart.selectAll('rect').on("click", function(d) {
			console.log("click!", d);
		});
	})
	.xAxis().ticks(5);


	// DATA TABLE

	dc.dataTable("#dc-table-graph")
	.dimension(dateDimension)
	.group(function (d) { return ''; })
	.size(650)
	.columns([
		function(d){ return d['date']; },
		function(d){ return ['Female','Male'][d['pat_d-sex']]; },
		function(d){ return (d['age']); },
		function(d){ return d['pat_d-nat_ty']; },
		function(d){ return d['vulnerability']; }
	])

	dc.renderAll();
}


