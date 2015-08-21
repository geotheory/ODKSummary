
// read in JSON file

var forms, json;
var $dom = $( "#maincontainer" );
var maxwidth = 100;

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
		var output = "";
		if(selected.val() != 0){
			output = "You Selected " + selected.val();

			// JSON data call
			var file = 'data/' + replace_all(selected.val(), '[.]', '_') + '.json';
			// console.log('calling ' + file);
			get_json(file);
		}
	}

	// append select options to dropdown in DOM
	var $odk_dropdown = $('#odk_dropdown');
	for(var i=0; i<forms.length; i++){
		$odk_dropdown.append($.parseHTML( '<option value="' + forms[i][0] + '">' + forms[i][1] + '</option>'));
	}
}

function get_json(file){
	$(function(){
		$.getJSON(file, function(jsdata) {
			json = jsdata;

			// seperate headers
			headers = [];
			for(var i=0; i<json.length; i++){
				headers.push( json[i].shift() );
			}
			 // main function
			summarise(json);
		});
	});
}


// DATA TYPE MANAGEMENT FUNCTIONS

// remove empty array slots
Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {         
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

// is numeric or coercible to numeric
function is_numeric(n){
	if(isNaN(n)) return false;
	if(n.toString() == '') return false;
	return true;
}

// count items coercible to numberic
function count_nums(array){
	var ncount = 0;
	for(var i=0; i<array.length; i++){
		var N = array[i];
		if(is_numeric(N)){ ncount ++;}
	}
	return ncount;
}

// STATS FUNCTIONS

function sum(array){
	var total = 0;
	for(var i = 0; i < array.length; i++){ total += array[i] ;}
	return total;
}

Array.prototype.max = function() { return Math.max.apply(null, this);};

Array.prototype.min = function() { return Math.min.apply(null, this);};

function mean(array){ return sum(array)/array.length;}

function median(array){
	var arr = array.slice(0);
	return arr.sort()[Math.round(arr.length/2 - .5)];
}

function quartile_1(array){
	var arr = array.slice(0);
	return arr.sort()[Math.round(arr.length * .25 - .5)];
}

function quartile_3(array){
	var arr = array.slice(0);
	return arr.sort()[Math.round(arr.length * .75 - .5)];
}

// string of number rounded to 2 decimals
function sf2(str){
	if(is_numeric(str)){
		var N = Math.round(Number(str) * 100)/100;
		return N.toString();
	}
	else {
		if(str == '') str = 'no data'
		return str;
	}
}

// FACTORISING ARRAYS

// unique values in array
Array.prototype.get_unique = function(){
	var u = {}, a = [];
	for(var i = 0, l = this.length; i < l; ++i){
		if(u.hasOwnProperty(this[i])) {
			continue;
		}
		a.push(this[i]);
		u[this[i]] = 1;
	}
	return a;
}

// dictionary of value counts
function summary_counts(array){
	var counts = {};
	for(var i = 0; i< array.length; i++) {
		var num = array[i];
		counts[num] = counts[num] ? counts[num]+1 : 1;
	}
	return counts;
}

// sorted array of most common tuples
function most_common(tup){
	var tuples = [];
	for (var key in tup) tuples.push([key, tup[key]]);
	tuples.sort(function(a, b) {
		a = a[1];
		b = b[1];
		return a < b ? 1 : (a > b ? -1 : 0);
	});
	return tuples;
}

// REPORTING FUNCTIONS

// for reporting fields with large n of numeric uniques
function report_stats(headr, array){
	var n = array.length;
	var arr = array.slice(0);
	arr = arr.map(Number).clean();
	var a = [];
	while(arr.length > 0){
		var N = arr.pop();
		if(is_numeric(N)){ a.push(N);}
	}
	return ('<b>' + headr + '</b> | min= ' + sf2(a.min()) + ' | Q1= ' + sf2(quartile_1(a)) + ' | median= ' + 
		sf2(median(a)) + ' | mean= ' + sf2(mean(a)) + ' | Q3= ' + sf2(quartile_3(a)) + 
		' | max= ' + sf2(a.max()) + ' | NaN= ' + (n-a.length) + '/' + n);
}

// for reporting fields with small n of uniques
function report_factors(headr, array){
	var counts = summary_counts(array);
	var ranked = most_common(counts);
	var report = '<b>' + headr + '</b>';
	for(var i=0; i<ranked.length; i++){
		report += " | '" + sf2(ranked[i][0]) + "': " + sf2(ranked[i][1]);
	}
	return report;
}

// for reporting fields with large n of non-numeric uniques
function report_many(headr, array){
	var w = maxwidth;
	var counts = summary_counts(array);
	var ranked = most_common(counts);
	var report = '<b>' + headr + '</b> | ' + ranked.length + ' unique';
	for(var i=0; i<ranked.length; i++){
		var appendum = " | '" + sf2(ranked[i][0]) + "': " + sf2(ranked[i][1]);
		report += appendum;
		w -= appendum.length;
		if(w < 0) return report;
	}
	return report;
}

// classify data row and report accordingly
function summarise_row(headr, array){
	var arr = array.slice(0);
	var n = array.length;                        // array length
	var n_numbers = count_nums(arr);             // numeric value count
	var n_uniques = arr.get_unique().length;     // unique value count
	var report;

	// workflow: determine data type and summarise/report accordingly
	if(n_uniques < 5){                           // few uniques - factorised
		report = report_factors(headr, array);
	}
	else{                                        // many uniques - continuous
		if(n_numbers/n > .67){                   // predominantly numeric
			report = report_stats(headr, array);
		}
		else{                                    // predominantly non-numeric
			report = report_many(headr, array);
		}
	}
	if(report.length > maxwidth) report =  report.substring(0,maxwidth) + '...';
	report = '<p class="lead">' + report + '</p>';
	return report;
}

function summarise(d){
	// remove previous reporting
	$( "#maincontainer" ).empty();
	
	// headline stats
	$dom.append($.parseHTML( '<h4>-- ' + d[0].length + ' records / ' + d.length + ' fields --</h4><br/>' ));
	
	// append summaries to DOM
	for(var i=0; i<d.length; i++){
		// report.push(summarise_row(headers[i], d[i]));
		var new_html = $.parseHTML( summarise_row(headers[i], d[i]) );
		$dom.append( new_html );
	}
}
