
// read in JSON file

$(function(){
	$.getJSON("data/odk_data2.json", function(jsdata) {
		json = jsdata;

		headers = [];

		for(var i=0; i<json.length; i++){
			headers.push( json[i].shift() );
		}

		summarise(json);
	});
});


// STATS & SUMMARY FUNCTIONS

Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {         
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

function sum(array){
	var total = 0;
	for(var i = 0; i < array.length; i++){
		total += array[i];
	}
	return(total);
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function mean(array){
	return( sum(array)/array.length );
}

function median(array){
	var arr = array.slice(0);
	return( arr.sort()[Math.round(arr.length/2 - .5)] );
}

function quartile_1(array){
	var arr = array.slice(0);
	return( arr.sort()[Math.round(arr.length * .25 - .5)] );
}

function quartile_3(array){
	var arr = array.slice(0);
	return( arr.sort()[Math.round(arr.length * .75 - .5)] );
}

function sf2(n){
	var N = Math.round(n * 100)/100;
	return( N.toString() );
}

function report_stats(array){
	var n = array.length;
	var arr = array.slice(0);
	arr = arr.map(Number).clean();
	var a = [];
	while(arr.length > 0){
		var N = arr.pop();
		if(!isNaN(N)) a.push(N);
	}
	return('min= ' + sf2(a.min()) + ' | Q1= ' + sf2(quartile_1(a)) + ' | median= ' + sf2(median(a)) + ' | mean= ' + sf2(mean(a)) + ' | Q3= ' + sf2(quartile_3(a)) + ' | max= ' + sf2(a.max())) + ' | NaN= ' + (n-a.length);
}

function summarise(d){
	console.log(report_stats(d[5]));
}


// // factorise list
// report = []

// for i in range(len(data)):
// 	l = sorted(data[i])
// 	g = [(g[0], len(list(g[1]))) for g in itertools.groupby(l)]
// 	len(g) // count of unique values
// 	// sorted tuple-list of unique value counts
// 	g2 = sorted(g,key=lambda x: x[1], reverse=True)
// 	line = ''
// 	for j in range(min(5, len(g))):
// 		line = line + str(g2[j][0]) + ': ' + str(g2[j][1]) + ' '
// 	report.append([ headers[i], line ])


// x = ['a','0','1','-1','1.23','-2.03']

// // return integers in a list
// [int(s) for s in x if s.isdigit()]


// // return floats in a list (inc ints)
// [float(s) for s in x if isReal(s)]

