
// read in JSON file

var forms, json, met,
	root_val, root_txt;
var $dom = $( "#maincontainer" );

// replace filename chars '.' with '_' - for some reason Briefcase changes these
function replace_all(str, find, replace){ return str.replace(new RegExp(find, 'g'), replace) ;}

// get list of available forms
forms = [{"id": "Boat_Data_Form_1-0", "desc": "Boat Data Form 1.0"}];
setup_dropdown();


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

// setup dropdown box (based on available forms) for data import
function setup_dropdown(){
	$(document).ready(function(){ $("#odk_dropdown").change(on_select_change);});

	function on_select_change(){
		d = d0 = j = met = undefined;
		var selected = $("#odk_dropdown option:selected");		
		if(selected.val() != 0){
			// JSON data paths
			root_val = replace_all(selected.val(), '-', '_');  // for convenient console access
			root_txt = selected.text();                        // as above
			var data = './data/' + replace_all(root_val, '[.]', '_') + '.json';
			var meta = './data/xml/' + replace_all(selected.text(), '[. ]', '_') + '.json';
			
			$.getJSON(data, function(d) {
				// datify relevant fields
				if(d.length > 0){
					var datefields = ['Date','date','SubmissionDate','start','end'];
					var headers = Object.keys(d[0]);
					for(var i=0; i<d.length; i++) for(var j=0; j<headers.length; j++) {
						if(datefields.indexOf(headers[j]) > -1) d[i][headers[j]] = to_date(d[i][headers[j]]);
					}
				}
				
				// call main function
				$('#eventchart').append('<h4>EVENT</h4><h4>(boat interception)</h4>');
				$('#agechart').append('<h4>AGE</h4>');
				$('#natchart').append('<h4>NATIONALITY</h4>');
				$('#sexchart').append('<h4>GENDER</h4>');
				summarise(d);

				// read-in meta-data json
				$.ajax({
					url: meta,
					type: "GET",
					dataType: "json",
					timeout: 2000,
					success: function(response) {
						met = response;

						// label lookup dictionary

					},
					error: function(x, t, m) {
						console.log('Ajax error: ' + t + '; ' + m);
						alert("Sorry, meta data file is not accessible :(\n\nThis means the ODK Collect field descriptions and selection labels\nare unavailable. Instead the underlying field ID's will be displayed.");
					}
				});
			});
		}
	}

	// append select options to dropdown in DOM
	var $odk_dropdown = $('#odk_dropdown');
	for(var i=0; i<forms.length; i++){
		$odk_dropdown.append($.parseHTML( '<option value="' + forms[i].id + '">' + forms[i].desc + '</option>'));
	}
}

// REPORTING FUNCTIONS

var j;

function summarise(json){
	// d0 = crossfilter(json); // permanent obj
	// d = crossfilter(json);  // working obj
	j = json;
	j.forEach(function(x) {
	    x['DEMOGRAPHICS-PATIENT_AGE'] = +x['DEMOGRAPHICS-PATIENT_AGE'];
	});

	var d = crossfilter(j);

	// var filterdim = d.dimension(function(d){ return d['TRIP_INFORMATION-TRIP_NUMBER'] ;});
	// var filtergroup = filterdim.group();
	// var filtergroup_vals = [];
	// filtergroup.top(Infinity).forEach(function(d){ filtergroup_vals.push(d.key);})
	// console.log(filtergroup_vals);
	// filtergroup_vals.forEach(function(d){ 
	// 	var str = '<option value="' + d + '">' + d + '</option>';
	// 	$('#odk_filter').append(str);
	// });
	// $('#odk_filter').on('change',function(e){
	// 	var value = $('#odk_filter').val();
	// 	filterdim.filter(value);
	// 	dc.updateall();
	// 	dc.clearall();

	// })

	drawGraphs(d);
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function drawGraphs(d){

	var age_chart = dc.barChart("#agechart");

	// AGE HISTOGRAM

	var ndx               = d,
	  ageDimension        = ndx.dimension(function(d) {return ''+(5*Math.floor(+d['DEMOGRAPHICS-PATIENT_AGE']/5));}),
	  ageCountGroup       = ageDimension.group();
	  //
	age_chart
	.width($('#agechart').width())
	.height(300)
	.x(d3.scale.ordinal().domain( Array.apply(0, Array(18)).map(function(_,b) { return ''+(5 * ((b + 1)-1)); }) ))
	.xUnits(dc.units.ordinal)
	.brushOn(false)
	.yAxisLabel("Frequency")
	.dimension(ageDimension)
	.group(ageCountGroup)
	.on('renderlet', function(chart) {
	    chart.selectAll('rect').on("click", function(d) {
	        console.log("click!", d);
	    });
	});


	// GENDER PIE
	var sex_chart = dc.pieChart("#sexchart");

	var sexDimension  = ndx.dimension(function(d) {return d['DEMOGRAPHICS-PATIENT_GENDER'];})
	  sexCountGroup = sexDimension.group();

	sex_chart
	.width($('#sexchart').width())
	.height(300)
	.slicesCap(4)
	.innerRadius($('#sexchart').width()/4)
	.dimension(sexDimension)
	.group(sexCountGroup)
	.legend(dc.legend());


	var nat_chart = dc.rowChart("#natchart");

	var natDimension  = ndx.dimension(function(d) {return d['DEMOGRAPHICS-ORIGIN_COUNTRY'];})
	  natCountGroup = natDimension.group();

	natsum = natCountGroup.top(1000);
	natlst = [];
	for(var i=0; i< natsum.length; i++){ natlst.push(natsum[i].key);}
	//console.log(natlst);

	nat_chart
	.width($('#natchart').width())
	.height(300)
	.ordering(function(d) { return -d.value })
	.dimension(natDimension)
	.group(natCountGroup)
	.colors(['#1f77b4'])
	.colorDomain([0,1])
	.colorAccessor(function(d,i){
        return i;
    })
	.on('renderlet', function(chart) {
	    chart.selectAll('rect').on("click", function(d) {
	        console.log("click!", d);
	    });
	});

	var event_chart = dc.rowChart("#eventchart");

	var eventDimension  = ndx.dimension(function(d) {return d['TRIP_INFORMATION-TRIP_NUMBER'];})
	  eventCountGroup = eventDimension.group();

	event_chart
	.width($('#eventchart').width())
	.height(120)
	.ordering(function(d) { return -d.value })
	.dimension(eventDimension)
	.group(eventCountGroup)
	.colors(['#1f77b4'])
	.colorDomain([0,1])
	.colorAccessor(function(d,i){
        return i;
    })
	.on('renderlet', function(chart) {
	    chart.selectAll('rect').on("click", function(d) {
	        console.log("click!", d);
	    });
	});


	dc.renderAll();
}


