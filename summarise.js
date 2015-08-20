
// read in JSON file

$(function(){
	$.getJSON("data/MOAS_OPD_v_7_23a.json", function(jsdata) {
		json = jsdata;

		headers = [];

		for(var i=0; i<json.length; i++){
			headers.push( json[i].shift() );
		}

		summarise(json);
	});
});

var maxwidth = 100;


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
function isNumeric(n){
	if(isNaN(n)) return false;
	if(n.toString() == '') return false;
	return true;
}

// count items coercible to numberic
function countNums(array){
	var ncount = 0;
	for(var i=0; i<array.length; i++){
		var N = array[i];
		if(isNumeric(N)){
			ncount ++;
		}
	}
	return ncount;
}

// STATS FUNCTIONS

function sum(array){
	var total = 0;
	for(var i = 0; i < array.length; i++){
		total += array[i];
	}
	return total;
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function mean(array){
	return sum(array)/array.length;
}

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
	if(isNumeric(str)){
		var N = Math.round(Number(str) * 100)/100;
		return N.toString();
	}
	else {
		if(str == '') str = 'no data'
		return str;
	}
}

// summary stats for numeric array
function report_stats(headr, array){
	var n = array.length;
	var arr = array.slice(0);
	arr = arr.map(Number).clean();
	var a = [];
	while(arr.length > 0){
		var N = arr.pop();
		if(isNumeric(N)){
			a.push(N);
		}
	}
	return ('<b>' + headr + '</b> | min= ' + sf2(a.min()) + ' | Q1= ' + sf2(quartile_1(a)) + ' | median= ' + 
		sf2(median(a)) + ' | mean= ' + sf2(mean(a)) + ' | Q3= ' + sf2(quartile_3(a)) + 
		' | max= ' + sf2(a.max()) + ' | NaN= ' + (n-a.length) + '/' + n);
}

// FACTORISING ARRAYS

// unique values in array
Array.prototype.getUnique = function(){
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
function summaryCounts(array){
	var counts = {};
	for(var i = 0; i< array.length; i++) {
		var num = array[i];
		counts[num] = counts[num] ? counts[num]+1 : 1;
	}
	return counts;
}

// sorted array of most common tuples
function mostCommon(tup){
	var tuples = [];
	for (var key in tup) tuples.push([key, tup[key]]);
	tuples.sort(function(a, b) {
		a = a[1];
		b = b[1];
		return a < b ? 1 : (a > b ? -1 : 0);
	});
	return tuples;
}

function report_factors(headr, array){
	var counts = summaryCounts(array);
	var ranked = mostCommon(counts);
	var report = '<b>' + headr + '</b>';
	for(var i=0; i<ranked.length; i++){
		report += " | '" + sf2(ranked[i][0]) + "': " + sf2(ranked[i][1]);
	}
	return report;
}

function report_many(headr, array){
	var w = maxwidth;
	var counts = summaryCounts(array);
	var ranked = mostCommon(counts);
	var report = '<b>' + headr + '</b> | ' + ranked.length + ' unique';
	for(var i=0; i<ranked.length; i++){
		var appendum = " | '" + sf2(ranked[i][0]) + "': " + sf2(ranked[i][1]);
		report += appendum;
		w -= appendum.length;
		if(w < 0) return report;
	}
	return report;
}


function summariseRow(headr, array){
	var arr = array.slice(0);
	var n = array.length;                   // array length
	var n_numbers = countNums(arr);         // numeric value count
	var n_uniques = arr.getUnique().length; // unique value count
	var report;

	// workflow: determine data type and summarise/report accordingly
	if(n_uniques < 5){           // few uniques - factorised
		report = report_factors(headr, array);
	}
	else{                        // many uniques - continuous
		if(n_numbers/n > .67){   // predominantly numeric
			report = report_stats(headr, array);
		}
		else{                    // predominantly non-numeric
			report = report_many(headr, array);
		}
	}
	if(report.length > maxwidth) report =  report.substring(0,maxwidth) + '...';
	report = '<p class="lead">' + report + '</p>';
	return report;
}

function summarise(d){
	$( "h4" ).remove( "#waitingfordata" );
	var $dom = $( "#maincontainer" );
	
	// headline stats
	$dom.append($.parseHTML( '<h4>-- ' + d[0].length + ' records / ' + d.length + ' fields --</h4><br/>' ));
	
	for(var i=0; i<d.length; i++){
		// report.push(summariseRow(headers[i], d[i]));
		var new_html = $.parseHTML( summariseRow(headers[i], d[i]) );
		$dom.append( new_html );
	}
	console.log('done');
}
