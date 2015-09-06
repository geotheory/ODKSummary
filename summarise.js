
// read in JSON file

var forms, json, met,
	root_val, root_txt;
var $dom = $( "#maincontainer" );


// replace filename chars '.' with '_' - for some reason Briefcase changes these
function replace_all(str, find, replace){ return str.replace(new RegExp(find, 'g'), replace) ;}

// get list of available forms
$(function(){
	$.getJSON("/forms.json", function(jsdata) {
		forms = jsdata;
		setup_dropdown();
	});
});

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

function summarise(json){
	// d0 = crossfilter(json); // permanent obj
	// d = crossfilter(json);  // working obj
	j = json;
	drawGraphs(j);
}


function drawGraphs(d){

	var age_chart = dc.barChart("#test");

	// AGE HISTOGRAM

	d.forEach(function(x) {
	    x['DEMOGRAPHICS-PATIENT_AGE'] = +x['DEMOGRAPHICS-PATIENT_AGE'];
	});

	var ndx                 = crossfilter(d),
	  ageDimension        = ndx.dimension(function(d) {return +d['DEMOGRAPHICS-PATIENT_AGE'];}),
	  speedSumGroup       = ageDimension.group().reduceSum(function(d) {return 5*Math.round(d['DEMOGRAPHICS-PATIENT_AGE']/5);});

	age_chart
	.width(500)
	.height(400)
	.x(d3.scale.linear().domain([0,80]))
	.brushOn(false)
	.yAxisLabel("Frequency")
	.dimension(ageDimension)
	.group(speedSumGroup)
	.on('renderlet', function(chart) {
	    chart.selectAll('rect').on("click", function(d) {
	        console.log("click!", d);
	    });
	});
	age_chart.render();


	// GENDER PIE

	// var sex_chart = dc.pieChart("#test");

	// var sexDimension  = ndx.dimension(function(d) {return d['DEMOGRAPHICS-PATIENT_GENDER'];})
	//   speedSumGroup = sexDimension.group().reduceSum(function(d) {return d['DEMOGRAPHICS-PATIENT_GENDER'];});

	// sex_chart
	// .width(500)
	// .height(400)
	// .slicesCap(4)
	// .innerRadius(100)
	// .dimension(sexDimension)
	// .group(speedSumGroup)
	// .legend(dc.legend());

	// sex_chart.render();

}


d3.csv(filename, function(error, experiments){

}


