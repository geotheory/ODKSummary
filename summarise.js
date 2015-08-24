
// read in JSON file

var forms, json;
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


// setup dropdown box based on available forms
function setup_dropdown(){
	$(document).ready(function(){ $("#odk_dropdown").change(on_select_change);});

	function on_select_change(){
		var selected = $("#odk_dropdown option:selected");		
		if(selected.val() != 0){
			// JSON data call
			var file = 'data/' + replace_all(selected.val(), '[.]', '_') + '.json';
			$.getJSON(file, function(d) {
				// call main function
				summarise(d);
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
	d = crossfilter(json);

	var n = d.groupAll().reduceCount().value();
	console.log(n);
}


