"use strict";

var vars_hm = new Object;
var bar_width = 11,
	bar_padding = 1;

$(document).ready(function () {
	processHosData();
	processHosEducationLevelData();
	processHosEducationLevelData2();
	processHosEducationLevelData3();
	    		    		
	assignEventListeners();
});

function processHosData() {
	var w=1035,
		h=400,
		multiplier=6,
		chart_area_y_min = 80,
		chart_area_y_max = h-40;
		
	d3.json('data/heads_of_states.json', function(data) {
		var svg = d3.select("#hos_data .content svg");
		
		//draw y axis and ticks	
    	var yScale = d3.scale.linear()
	        .domain([0, 47])
        	.range([chart_area_y_min, chart_area_y_max]);
        	
        var yAxis = d3.svg.axis()
    	    .scale(yScale)
	        .orient("left")
    	    .tickFormat(d3.format("b")) //so e.g. convert 4,000,000 to 4M
        	.ticks(3);
        	
		svg.append("g")
    		.attr("class", "axis y")
	    	.attr("transform", "translate(" + 16 + ", 8)")
	    	.call(yAxis);
	    	
	    svg.append("text")
	    	.text("years")
	    	.attr("dx", 2)
	    	.attr("dy", 360)
	    	//.attr("transform", function(d,i) { return "rotate(-90,115,115) translate(0,-5)"; })
	    	.style("font-family", "Georgia")
	    	.style("font-size", "10px")
	    	.style("font-style", "italic");

		var g = svg.selectAll('#hos_data .content rect')
    		.data(data.countries)
    		.enter()
    		.append("g")
    			.attr("class", function(d, i) { return d.country_code; });
		
		var j = 0;
    	g.append('text')
    		.text(function(d, i) { return d.country; })
			.attr('dx', function(d, i) { return (i*(bar_width+bar_padding)); })
			.attr('dy', 80)
			.attr("class", function(d) { return d.country_code + "_text"; })
			.attr('transform', function(d, i) { return 'rotate(-90,' + (((i*(bar_width+bar_padding)))+20) + ',' + 50 + ') translate(-7,-1)'; });
			
    	g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.is_democracy == "1") return "bars bars_democracy";
    			else return "bars";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		/*.attr("stroke", "#fffefa")
    		.attr("stroke-width", "1px")*/
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) { 
	    		var max = 0, n = 0, max_name = "", max_date = "";
	    		d.tenures = new Array();
	    		
	    		for(var i=0;i<d.data.length;i++) {
	    			//for the last item, compare to this year (2012)
					if(i == d.data.length-1) {
						//n = new Date().getFullYear()+1 - d.data[i].date; //add 1 to current year since we're in december
						//n = new Date().getFullYear() - d.data[i].date; //don't add 1 to current year since we're in december :)
						n = 2013 - d.data[i].date;
						if(n >= max) {
							max = n;
							max_name = d.data[i].name;
		    				max_date = d.data[i].date;
						}
					}
					else {
						//console.log(d.country + " :: " + d.data[i+1].date + " - " + d.data[i].date);
		    			n = d.data[i+1].date - d.data[i].date;
		    			
		    			//if less than one year, round to one year
		    			if(n == 0) n = 1;
		    				
		    			//console.log(n);
		    			if(n >= max) { 
		    				max = n;
		    				max_name = d.data[i].name;
		    				max_date = d.data[i].date;
		    			}
		    		}
		    		
		    		//add the lengths to our data item for calculating median later on
		    		d["tenures"].push(n);
		    		console.log(d);
	    		}
	    		
	    		//console.log(d);
	    		
	    		d.longest_serving = max;
	    		d.longest_serving_name = max_name;
	    		d.longest_serving_date = max_date;
	    		
	    		return max*multiplier;
	    	})	
			
			//a transparent copy of each rect to make it easier to hover over rects
			g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.is_democracy == "1") return "bars_hover bars_democracy";
    			else return "bars_hover";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		.style('opacity', '0')
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) {
				//get them from the original
	    		d.longest_serving = d3.select(".content svg ." + d.country_code + " .bars").data()[0].longest_serving;
	    		d.longest_serving_name = d3.select(".content svg ." + d.country_code + " .bars").data()[0].longest_serving_name;
	    		d.longest_serving_date = d3.select(".content svg ." + d.country_code + " .bars").data()[0].longest_serving_date;
	    		d.tenures = d3.select(".content svg ." + d.country_code + " .bars").data()[0].tenures;
	    		
	    		return 300; //height of transparent bar
	    	})
	    	.on('mouseover', function(d) {
		    	$("#seperator").css("border-left-width", "1px");
	    		$("#country_name_big #sparklines").show();
	    		$("#country_name_big #sparklines #geezers_name").html("");
	    		draw(d, "#sparklines #content_plot", "s", false, "");
	    		
	    		d3.selectAll("#hos_data .content svg .bars").style('fill', "#CDD7B6");
	    		//d3.selectAll("#hos_data .content svg g text").style("text-transform", "none");
	    		
				$(".content svg ." + d.country_code + " .bars")
					.css('fill', "#aaba85"); //a9a8a8
				
				var max_term = function(d) {
					return (d.max_term > 0) ? d.max_term + " years" : "none";
				};
				
				console.log(d.tenures);
				
				//todo, add months and days to fix this issue
				var to_date = (Number(d.longest_serving_date) + Number(d.longest_serving));
				if(to_date == 2013)
					to_date = 2012;
				
		    	var html_content = d.country + "<br /><span id='details'><p>" + d.longest_serving_name + "</p><p style='padding-bottom:10px'>" 
		    			+ d.longest_serving_date + "-" + to_date 
		    			+ " (" + d.longest_serving + " years)</p><p class='small'>Maximum term limit<sup>&dagger;</sup>: " + max_term(d) + "</p>"
		    			+ "<p class='small'>Median time in office: " + d3.median(d.tenures) 
		    			+ " years (approx)</p>"
		    			+ "<p class='blob'>" + d.blob + "</p>"
		    			+ "</span>";
		    			
		    	$("#country_name_big #content").html(html_content);
			});	
			
		//add max term limits
		/*g.append('rect')
	    	.attr('class', 'max_term_limit')
	    	.style('display', 'none')
	    	.style("fill", "#e78924")
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', function(d, i) {
    			if(d.max_term == 0) return -100;
    			return 80 + (Number(d.max_term) * multiplier);
    		})
    		.attr('width', bar_width)
	    	.attr('height', 2);*/
	    	
	    		    
	    //add median bars
	    g.append('rect')
	    	.attr('class', 'median_tenure')
	    	//.style('display', 'none')
	    	.style("fill", "#e78924")
	    	.attr('shape-rendering', 'crispEdges')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', function(d, i) {
    			//console.log(d.tenures.length);
    			if(d.tenures.length == 1) return 0;
    			
    			//console.log(d.country + " :: " + d3.median(d.tenures));
    			//remove 0s, i.e. people who have ruled for less than a year
    			$.each(d.tenures, function(i, val) {
    				if(val == 0) d.tenures.splice(i,1);
    			});
    			return 80 + (d3.median(d.tenures) * multiplier) - 2;
    		})
    		.attr('display', function(d) {
				if(d.tenures.length == 1) return "none";
    		})
    		.attr('width', bar_width)
	    	.attr('height', 2);
	    	
	    	
	    
		if ($.browser.mozilla) {
			g.append('svg:line')
    			.attr("class","dividers")	
	    		.attr('x1', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('x2', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('y1', 0)
	    		.attr('y2', h);
    	}
	    	
	    //draw extended ticks (horizontal)
    	var ticks = svg.selectAll('.ticky')
	    	.data(yScale.ticks(3))
    		.enter()
    			.append('svg:g')
    			.attr('transform', function(d) {
	      			return "translate(0, " + (yScale(d)) + ")";
    			})
    			.attr('class', 'ticky')
	    	.append('svg:line')
    			.attr("stroke-dasharray","1,3")
    			.attr('y1', 1)
	    		.attr('y2', 1)
    			.attr('x1', 8)
    			.attr('x2', w+25);
	    	
	    //remove spacers
	    $(".spacer").hide();
	    
	    //initial country
	    //todo
		//d3.select(".content svg .CU .bars").style('fill', "#aaba85");
		var html_content = "Cuba<br /><span id='details'><p>Fidel Castro</p>"
		   		+ "<p style='padding-bottom:10px'>1959-2006 (47 years)</p>"
		   		+ "<p class='small'>Maximum term limit<sup>&dagger;</sup>: none</p>"
		   		+ "<p class='small'>Median time in office: 10 years (approx)</p>"
				+ "</span>";
		$("#country_name_big #content").html(html_content);
		
		//select Cuba when page first loads
		d3.select(".content svg .CU .bars").style('fill', "#aaba85");
		var data_cuba = d3.select("#hos_data .content svg .CU rect.bars").data()[0];
		draw(data_cuba, "#sparklines #content_plot", "s", false, "");
		
		
		//initial country
		//todo (clean this up)
		for(var i=2;i<=4;i++) {
			var text;
			if(i == 2) text = "<p>0% have held a graduate degree or equivalent</p><p>0 out of 3 leaders</p>";
			else if(i == 3) text = "<p>67% have at least held an undergraduate degree or equivalent</p><p>2 out of 3 leaders</p>";
			else if(i == 4) text = "<p>100% have graduated from secondary school</p><p>3 out of 3 leaders</p>";
			
		    //d3.select(".content svg .CU .bars").style('fill', "#aaba85");
			var html_content = "<div id='content" + i + "'>Cuba<br><span id='details'>" + text + "</span></div>";
			$("#country_name_big" + i + " #content" + i).html(html_content);
			d3.select(".content" + i + " svg .CU .bars").style('fill', "#bababa"); //aaba85
			var data_cuba = d3.select("#hos_data .content svg .CU rect.bars").data()[0];
			$("#country_name_big" + i + " #sparklines" + i + "").show();
	    	$("#country_name_big" + i + " #sparklines" + i + " #geezers_name" + i).html("");
		    $("#seperator" + i).css("border-left-width", "1px");
	    	drawEducationLevels(data_cuba, "#sparklines" + i + " #content_plot" + i, "s", i);
			$("#sparklines" + i + " svg .y g text").hide(); //hide axes text
		}
	});
}

function draw(data, container, format) {
	//console.log(data);
	$(container).html("");

	var w = 200,
		h = 110,
		xPadding = 0,
		yPadding = 30;
	
	//for clarity, we reassign
	var which_metric = container;
	
    //prepare our scales and axes
    var xMin = 0, //d3.min(data.data, function(d){ return d.date; }),
	    xMax = data.data.length, //d3.max(data.data, function(d){ return d.date; }),
	    yMin = d3.min(data.tenures),
        yMax = d3.max(data.tenures);

    //scale exceptions
    if(format == "%") {
    	yMax = 1; //0 to 100%
    }
	
	//console.log(data_to_plot);
   	var xScale = d3.scale.linear()
        .domain([0, xMax])
        .range([5, w]);
            
    var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([h-yPadding+2, yPadding-6]);
            
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
            
	var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format(format)) //so e.g. convert 4,000,000 to 4M
        .ticks(2);
            
    //draw svg
	var svg = d3.select(container)
        .append("svg")
        .attr("width", w+50)
        .attr("height", h);
    		
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(-26," + (h-xPadding-3) + ")")
    	.call(xAxis);
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);
    	
	var line = d3.svg.line()
		.x(function(d,i){ return xScale(i); })
		.y(function(d){ return yScale(d); });
		//.interpolate("basis");

	var paths = svg.append("svg:path")
	    .attr("class", "the_glorious_line default_path_format")
    	.attr("d", line(data.tenures));  	

	//draw points
	var circle = svg.selectAll("circle")
   		.data(data.tenures)
   		.enter()
   			.append("circle")
   			.attr('class','point')
   			.attr('opacity', 1)
   			.attr("cx", function(d,i) {
        		return xScale(i);
   			})
   			.attr("cy", function(d) { return yScale(d); })
   			.attr("r", 3)
   			.each(function(d, i) {
					//a transparent copy of each rect to make it easier to hover over rects
					svg.append('rect')
		    			.attr('shape-rendering', 'crispEdges')
		    			.style('opacity', 0)
			    		.attr('x', function() { return xScale(i)-5; })
    					.attr('y', 10)
	    				.attr("class", "trans_rect")
    					.attr('shape-rendering', 'crispEdges')
	    				.attr('width', function() {
	    					return w/data.tenures.length;
			    		})
				    	.attr('height', 120) //height of transparent bar
				    	.on('mouseover', function() {
							d3.selectAll(".tooltip").remove(); //timestamp is used as id
							d3.selectAll(".tooltip_box").remove(); //timestamp is used as id
							
							d3.select(which_metric + " svg")
								.append("svg:rect")
								.attr("width", 40)
								.attr("height", 18)
								.attr("x", function() { return xScale(i)-5; })
								.attr("y", function() { return yScale(d)-25; })
								.attr("class", "tooltip_box");
						
							d3.select(which_metric + " svg")
								.append("text")
									.text(function() {
										//return data.data[i].name + " (" + d + " yrs)";
						
										var from = data.data[i].date;
										var to = (i == data.data.length-1) ? "2012" : data.data[i+1].date;
										$("#geezers_name").html(data.data[i].name + ", " + from + "-" + to);
//						console.log("from: " + from + ", to: " + to);
										var years = (d > 1) ? "yrs" : "yr";
										return d + " " + years;
									})
									//.attr("geezers_name", function() { return data.data[i].name; })
									.attr("x", function() { return xScale(i)+15; })
									.attr("y", function() { return yScale(d)-12; })
									.attr("text-anchor", "start")
									.attr("class", "tooltip")
									.attr("cursor", "default");
						})
						.attr('class', 'line_label');
				});
				
	/*svg.selectAll("circle")
		.on('mouseover.tooltip', function(d,i) {
			d3.selectAll(".tooltip").remove(); //timestamp is used as id
			d3.select(which_metric + " svg")
				.append("svg:rect")
					.attr("width", 40)
					.attr("height", 18)
					.attr("x", function() { return xScale(i)-5; })
					.attr("y", function() { return yScale(d)-25; })
					.attr("class", "tooltip_box");
						
			d3.select(which_metric + " svg")
				.append("text")
					.text(function() {
						//return data.data[i].name + " (" + d + " yrs)";
						
						var from = data.data[i].date;
						var to = (i == data.data.length-1) ? "2012" : data.data[i+1].date;
						$("#geezers_name").html(data.data[i].name + ", " + from + "-" + to);
						
						var years = (d > 1) ? "yrs" : "yr";
						return d + " " + years;
					})
					//.attr("geezers_name", function() { return data.data[i].name; })
					.attr("x", function() { return xScale(i)+15; })
					.attr("y", function() { return yScale(d)-12; })
					.attr("text-anchor", "start")
					.attr("class", "tooltip");
		})
		.on('mouseout.tooltip', function(d) {
			d3.select(".tooltip_box").remove();
			d3.select(".tooltip")
				.transition()
				.duration(200)
				.style("opacity", 0)
				.attr("transform", "translate(0,-10)")
				.remove();
		})
		.on('mouseover', function(d) {				
			d3.select(this)
				.transition()
		    	.attr("r", 3);
		}).on('mouseout', function() {
      		d3.select(this)
				.transition()
			   	.attr("r", 3);
      	})
		.append("text")
			.text(function(d) {
		    	return d;
		})
		.attr('class', 'line_label')
		.attr("x", function(d,i) {
   			return xScale(i)-5;
		})
		.attr("y", function(d) { return yScale(d); });
		*/
		
		
		//hide axes
		$("#sparklines svg text").hide();
}

function drawEducationLevels(data, container, format, which_one) {
	//get the data array for this country since we need the education levels
	var data = d3.select(".content svg ." + data.country_code + " .bars").data()[0];
	
	//set the points to a smaller radius for switzerland
	var point_radius = 3;
	if(data.country_code == "CH")
		point_radius = 2;
	    		
	//console.log(data);
	$(container).html("");

	var w = 200,
		h = 110,
		xPadding = 0,
		yPadding = 30;
	
	//for clarity, we reassign
	var which_metric = container;

    //prepare our scales and axes
    var xMin = 0, //d3.min(data.data, function(d){ return d.date; }),
	    xMax = data.data.length, //d3.max(data.data, function(d){ return d.date; }),
	    yMin = 0,
        yMax = 3; //0 is no school, 3 is graduate

	//console.log(data_to_plot);
   	var xScale = d3.scale.linear()
        .domain([0, xMax])
        .range([5, w]);
            
    var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([h-yPadding+2, yPadding-6]);
            
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
            
	var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format(format)) //so e.g. convert 4,000,000 to 4M
        .ticks(3);
            
    //draw svg
	var svg = d3.select(container)
        .append("svg")
        .attr("width", w+50)
        .attr("height", h);
    		
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(-26," + (h-xPadding-3) + ")")
    	.call(xAxis);
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);
  
    
    svg.append('text')
    	.text(function() { return "Grad"; })
    	.style('opacity', '0.4')
    	.style("cursor", "default")
    	.attr('dx', 6)
		.attr('dy', 33);
		
	svg.append('text')
    	.text(function() { return "Undergrad"; })
    	.style('opacity', '0.4')
    	.style("cursor", "default")
		.attr('dx', 6)
		.attr('dy', 52);
		
	svg.append('text')
    	.text(function() { return "School"; })
    	.style('opacity', '0.4')
    	.style("cursor", "default")
		.attr('dx', 6)
		.attr('dy', 71);
		
	svg.append('text')
    	.text(function() { return "None/unknown"; })
    	.style("cursor", "default")
    	.style('opacity', '0.4')
		.attr('dx', 6)
		.attr('dy', 90);
			

    var ticks = svg.selectAll('.ticky_edu')
    	.data(yScale.ticks(3))
    	.enter()
    		.append('svg:g')
    		.attr('transform', function(d ,i) {
      			return "translate(0, " + (yScale(i)) + ")";
    		})
    		.attr('class', 'ticky_edu')
    	.append('svg:line')
    		.attr("stroke-dasharray","1,3")
    		.attr('y1', -1)
    		.attr('y2', -1)
    		.attr('x1', 5)
    		.attr('x2', w);
    		
    	
	var line = d3.svg.line()
		.x(function(d,i){ return xScale(i); })
		.y(function(d){ return yScale(d.edu_code); });
		//.interpolate("basis");

	var paths = svg.append("svg:path")
	    .attr("class", "the_glorious_line default_path_format")
    	.attr("d", function() {
    		//remove data items that are -1, e.g. transitional periods (Iraq, Libya)
		    return line(sanitize(data.data));
    	});

	//draw points
	var circle = svg.selectAll("circle")
   		.data(sanitize(data.data))
   		.enter()
   			.append("circle")
   			.attr('class','point')
   			.attr('opacity', 1)
   			.attr("cx", function(d,i) {
        		return xScale(i);
   			})
   			.attr("cy", function(d) { return yScale(d.edu_code); })
   			.attr("r", function(d) {
   				return point_radius;
   			})
   			.each(function(d, i) {
					//a transparent copy of each rect to make it easier to hover over rects
					svg.append('rect')
		    			.style('opacity', 0)
	    				.attr('width', function() {
	    					return w/data.data.length;
			    		})
				    	.attr('height', 100) //height of transparent bar				    	
						.attr("x", function() {
				   			return xScale(i)-10;
						})
						.attr("y", 10)
				    	.on('mouseover', function() {
							d3.selectAll(".tooltip").remove(); //timestamp is used as id
							d3.selectAll(".tooltip_box").remove(); //timestamp is used as id
							
							//sanitize() gives us the data array without transitional periods, etc
							$("#geezers_name" + which_one).html(sanitize(data.data)[i].name);
						})
						.on('mouseout.tooltip', function() {
							d3.select(".tooltip_box").remove();
							d3.select(".tooltip")
								.transition()
								.duration(200)
								.style("opacity", 0)
								.attr("transform", "translate(0,-10)")
								.remove();
						})
						.append("text")
							.text(function() {
						    	return d.name;
						})
						.attr('class', 'line_label');
				});

	/*svg.selectAll("circle")
		.on('mouseover.tooltip', function(d,i) {
			//sanitize() gives us the data array without transitional periods, etc
			$("#geezers_name" + which_one).html(sanitize(data.data)[i].name);
		})
		.on('mouseout.tooltip', function(d) {
			d3.select(".tooltip_box").remove();
			d3.select(".tooltip")
				.transition()
				.duration(200)
				.style("opacity", 0)
				.attr("transform", "translate(0,-10)")
				.remove();
		})
		.append("text")
			.text(function(d) {
		    	return d;
		})
		.attr('class', 'line_label')
		.attr("x", function(d,i) {
   			return xScale(i)-5;
		})
		.attr("y", function(d) { return yScale(d); });*/
		
		//hide axes text
		$("#sparklines" + which_one + " svg .y g text").hide();
}

function sanitize(data) {
	var data_sanitized = Array();
	    			
	//remove data items that are 0
	$.each(data, function(i, value) {
		if(value.edu_code != "-1")
	    	data_sanitized.push(value);
	});
	
	return data_sanitized;
}


function processHosEducationLevelData() {
	var w=1065,
		h=400,
		multiplier=2,
		chart_area_y_min = 80,
		chart_area_y_max = 285;
		
	//no sidebar initially
	$("#country_name_big2 #sparklines2").hide();
	
		
	d3.json('data/heads_of_states_education.json', function(data){
		var svg = d3.select("#hos_data .content2 svg");
		
		//draw y axis and ticks	
    	var yScale = d3.scale.linear()
	        .domain([0, 1])
        	.range([chart_area_y_min, chart_area_y_max]);
        	
        var yAxis = d3.svg.axis()
    	    .scale(yScale)
	        .orient("left")
    	    .tickFormat(d3.format("%")) //so e.g. convert 4,000,000 to 4M
        	.ticks(3);
        	
		svg.append("g")
    		.attr("class", "axis y")
	    	.attr("transform", "translate(" + 16 + ", 8)")
	    	.call(yAxis);
   
		var g = svg.selectAll('#hos_data .content2 rect')
    		.data(data.countries)
    		.enter()
    		.append("g")
    			.attr("class", function(d, i) { return d.country_code; });
		
    	g.append('text')
    		.text(function(d, i) { return d.country; })
			.attr('dx', function(d, i) { return (i*(bar_width+bar_padding)); })
			.attr('dy', 80)
			.attr("class", function(d) { return d.country_code + "_text"; })
			.attr('transform', function(d, i) { return 'rotate(-90,' + (((i*(bar_width+bar_padding)))+20) + ',' + 50 + ') translate(-7,-1)'; });
			
    	g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.all <= 5) return "bars bars_too_few_heads";
    			else return "bars";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) { 
	    		return 5+((d.postgraduate) / d.all * 100) * multiplier;
	    		//return d.postgraduate * multiplier;
	    	})
			
			//a transparent copy of each rect to make it easier to hover over rects
			g.append('rect')
	    		.attr('shape-rendering', 'crispEdges')
    			.style('opacity', '0')
	    		.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    			.attr('y', 80)
    			.attr("class", function(d, i) {
    				if(d.all <= 5) return "bars bars_too_few_heads";
	    			else return "bars";
    			})
    			.attr('shape-rendering', 'crispEdges')
	    		.attr('width', function() {
    				if($.browser.mozilla)
    					return bar_width+1; //fixes border issue in firefox
	    			else
    					return bar_width;
	    		})
		    	.attr('height', function(d, i) {
					return 300; //height of transparent bar
		    	})
	    		.on('mouseover', function(d) {
	    			$("#country_name_big2 #sparklines2").show();
	    			$("#country_name_big2 #sparklines2 #geezers_name2").html("");

	    			drawEducationLevels(d, "#sparklines2 #content_plot2", "s", "2");
	    			    		
		    		$("#seperator2").css("border-left-width", "1px");

		    		//reset all colors
		    		d3.selectAll("#hos_data .content2 svg .bars").style('fill', "#CDD7B6"); //ffc48c
	    			d3.selectAll("#hos_data .content2 svg .bars_too_few_heads").style('fill', "#e1e1e1");
				
					//set mouseover color
					var orig_rect = d3.select(".content2 svg ." + d.country_code + " .bars");
		    		if(orig_rect.attr("class") == "bars bars_too_few_heads")
						orig_rect.style('fill', "#bababa");
			    	else
			    		orig_rect.style('fill', "#aaba85");
			    		
			    	//show info
			    	$("#country_name_big2 #content2")
			    		.html(d.country + "<br /><span id='details'><p>" + Math.round((d.postgraduate/d.all*100)) + "% have held a graduate degree or equivalent</p><p>" + d.postgraduate + " out of " + d.all + " leaders</p></span>");
				});
			
			
			$("#hos_data .content2 .bars_too_few_heads").css("fill", "#e1e1e1");
			
			if ($.browser.mozilla) {
				g.append('svg:line')
    			.attr("class","dividers")	
	    		.attr('x1', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('x2', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('y1', 0)
	    		.attr('y2', h);
    		}
		   	
	    	//draw extended ticks (horizontal)
	    	var ticks = svg.selectAll('.ticky')
		    	.data(yScale.ticks(3))
    			.enter()
    				.append('svg:g')
    				.attr('transform', function(d) {
		      			return "translate(0, " + (yScale(d)) + ")";
    				}) 
    				.attr('class', 'ticky')
		    	.append('svg:line')
    				.attr("stroke-dasharray","1,3")
    				.attr('y1', 0)
	    			.attr('y2', 0)
    				.attr('x1', 8)
	    			.attr('x2', w); 
	    			
	    	//remove spacers
		    $(".spacer").hide();
		});
}

function processHosEducationLevelData2() {
	var w=1065,
		h=400,
		multiplier=2,
		chart_area_y_min = 80,
		chart_area_y_max = 285;
		
	//no sidebar initially
	$("#country_name_big3 #sparklines3").hide();
		
	d3.json('data/heads_of_states_education.json', function(data){
		var svg = d3.select("#hos_data .content3 svg");
		
    	//draw y axis and ticks	
    	var yScale = d3.scale.linear()
	        .domain([0, 1])
        	.range([chart_area_y_min, chart_area_y_max]);
        	
        var yAxis = d3.svg.axis()
    	    .scale(yScale)
	        .orient("left")
    	    .tickFormat(d3.format("%")) //so e.g. convert 4,000,000 to 4M
        	.ticks(3);
        	
		svg.append("g")
    		.attr("class", "axis y")
	    	.attr("transform", "translate(" + 16 + ", 8)")
	    	.call(yAxis);
            
		var g = svg.selectAll('#hos_data .content3 rect')
    		.data(data.countries)
    		.enter()
    		.append("g")
    			.attr("class", function(d, i) { return d.country_code; });
		
    	g.append('text')
    		.text(function(d, i) { return d.country; })
			.attr('dx', function(d, i) { return (i*(bar_width+bar_padding)); })
			.attr('dy', 80)
			.attr("class", function(d) { return d.country_code + "_text"; })
			.attr('transform', function(d, i) { return 'rotate(-90,' + (((i*(bar_width+bar_padding)))+20) + ',' + 50 + ') translate(-7,-1)'; });
			
    	g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.all <= 5) return "bars bars_too_few_heads";
    			else return "bars";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) {
	    		var n = Number(d.postgraduate)+Number(d.undergraduate);
	    		return 5+(n / d.all * 100) * multiplier;
	    		//return d.undergraduate * multiplier;
	    	})
			
			//a transparent copy of each rect to make it easier to hover over rects
			g.append('rect')
	    		.attr('shape-rendering', 'crispEdges')
    			.style('opacity', '0')
	    		.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    			.attr('y', 80)
    			.attr("class", function(d, i) {
    				if(d.all <= 5) return "bars bars_too_few_heads";
	    			else return "bars";
    			})
    			.attr('shape-rendering', 'crispEdges')
	    		.attr('width', function() {
    				if($.browser.mozilla)
    					return bar_width+1; //fixes border issue in firefox
	    			else
    					return bar_width;
	    		})
		    	.attr('height', function(d, i) {
					return 300; //height of transparent bar
		    	})
	    		.on('mouseover', function(d) {
	    			var n = Number(d.undergraduate)+Number(d.postgraduate);
	    			
	    			$("#country_name_big3 #sparklines3").show();
	    			$("#country_name_big3 #sparklines3 #geezers_name3").html("");

	    			drawEducationLevels(d, "#sparklines3 #content_plot3", "s", "3");
	    			
		    		$("#seperator3").css("border-left-width", "1px");

		    		//reset all colors
		    		d3.selectAll("#hos_data .content3 svg .bars").style('fill', "#CDD7B6"); //ffc48c
	    			d3.selectAll("#hos_data .content3 svg .bars_too_few_heads").style('fill', "#e1e1e1");
				
					//set mouseover color
					var orig_rect = d3.select(".content3 svg ." + d.country_code + " .bars");
		    		if(orig_rect.attr("class") == "bars bars_too_few_heads")
						orig_rect.style('fill', "#bababa");
			    	else
			    		orig_rect.style('fill', "#aaba85");
			    		
			    	//show info
			    	$("#country_name_big3 #content3")
			    		.html(d.country + "<br /><span id='details'><p>" + Math.round(n/d.all*100) + "% have at least held an undergraduate degree or equivalent</p><p>" + n + " out of " + d.all + " leaders</p></span>");
				});
			
			$("#hos_data .content3 .bars_too_few_heads").css("fill", "#e1e1e1");
			
			if ($.browser.mozilla) {
				g.append('svg:line')
    			.attr("class","dividers")	
	    		.attr('x1', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('x2', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('y1', 0)
	    		.attr('y2', h);
    		}
    	
			//draw extended ticks (horizontal)
	    	var ticks = svg.selectAll('.ticky')
	    		.data(yScale.ticks(3))
    			.enter()
    				.append('svg:g')
	    			.attr('transform', function(d) {
	      				return "translate(0, " + (yScale(d)) + ")";
    				})
    				.attr('class', 'ticky')
		    	.append('svg:line')
    				.attr("stroke-dasharray","1,3")
    				.attr('y1', 0)
	    			.attr('y2', 0)
    				.attr('x1', 8)
	    			.attr('x2', w);
	    			
	    	//remove spacers
		    $(".spacer").hide();
		});
}

function processHosEducationLevelData3() {
	var w=1065,
		h=400,
		multiplier=2,
		chart_area_y_min = 80,
		chart_area_y_max = 285;
		
	//no sidebar initially
	$("#country_name_big4 #sparklines4").hide();
		
	d3.json('data/heads_of_states_education.json', function(data){
		var svg = d3.select("#hos_data .content4 svg");
		
    	//draw y axis and ticks	
    	var yScale = d3.scale.linear()
	        .domain([0, 1])
        	.range([chart_area_y_min, chart_area_y_max]);
        	
        var yAxis = d3.svg.axis()
    	    .scale(yScale)
	        .orient("left")
    	    .tickFormat(d3.format("%")) //so e.g. convert 4,000,000 to 4M
        	.ticks(3);
        	
		svg.append("g")
    		.attr("class", "axis y")
	    	.attr("transform", "translate(" + 16 + ", 8)")
	    	.call(yAxis);
        	            
		var g = svg.selectAll('#hos_data .content4 rect')
    		.data(data.countries)
    		.enter()
    		.append("g")
    			.attr("class", function(d, i) { return d.country_code; });
		
    	g.append('text')
    		.text(function(d, i) { return d.country; })
			.attr('dx', function(d, i) { return (i*(bar_width+bar_padding)); })
			.attr('dy', 80)
			.attr("class", function(d) { return d.country_code + "_text"; })
			.attr('transform', function(d, i) { return 'rotate(-90,' + (((i*(bar_width+bar_padding)))+20) + ',' + 50 + ') translate(-7,-1)'; });
			
    	g.append('rect')
	    	.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    		.attr('y', 80)
    		.attr("class", function(d, i) {
    			if(d.all <= 5) return "bars bars_too_few_heads";
    			else return "bars";
    		})
    		.attr('shape-rendering', 'crispEdges')
    		.attr('width', function() {
    			if($.browser.mozilla)
    				return bar_width+1; //fixes border issue in firefox
    			else
    				return bar_width;
    		})
	    	.attr('height', function(d, i) {
	    		var n = Number(d.postgraduate)+Number(d.undergraduate)+Number(d.secondary);
	    		return 5+(n / d.all * 100) * multiplier;
	    		//return d.undergraduate * multiplier;
	    	})
			
			//a transparent copy of each rect to make it easier to hover over rects
			g.append('rect')
	    		.attr('shape-rendering', 'crispEdges')
    			.style('opacity', '0')
	    		.attr('x', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
    			.attr('y', 80)
    			.attr("class", function(d, i) {
    				if(d.all <= 5) return "bars bars_too_few_heads";
	    			else return "bars";
    			})
    			.attr('shape-rendering', 'crispEdges')
	    		.attr('width', function() {
    				if($.browser.mozilla)
    					return bar_width+1; //fixes border issue in firefox
	    			else
    					return bar_width;
	    		})
		    	.attr('height', function(d, i) {
					return 300; //height of transparent bar
		    	})
	    		.on('mouseover', function(d) {
	    			var n = Number(d.postgraduate)+Number(d.undergraduate)+Number(d.secondary);
	    			
	    			$("#country_name_big4 #sparklines4").show();
	    			$("#country_name_big4 #sparklines4 #geezers_name4").html("");

	    			drawEducationLevels(d, "#sparklines4 #content_plot4", "s", "4");
	    			
		    		$("#seperator4").css("border-left-width", "1px");

		    		//reset all colors
		    		d3.selectAll("#hos_data .content4 svg .bars").style('fill', "#CDD7B6"); //ffc48c
	    			d3.selectAll("#hos_data .content4 svg .bars_too_few_heads").style('fill', "#e1e1e1");
				
					//set mouseover color
					var orig_rect = d3.select(".content4 svg ." + d.country_code + " .bars");
		    		if(orig_rect.attr("class") == "bars bars_too_few_heads")
						orig_rect.style('fill', "#bababa");
			    	else
			    		orig_rect.style('fill', "#aaba85");
			    		
			    	//show info
			    	$("#country_name_big4 #content4")
			    		.html(d.country + "<br /><span id='details'><p>" + Math.round(n/d.all*100) + "% have graduated from secondary school</p><p>" + n + " out of " + d.all + " leaders</p></span>");
				});
			
			
			$("#hos_data .content4 .bars_too_few_heads").css("fill", "#e1e1e1");
			
			if ($.browser.mozilla) {
				g.append('svg:line')
    			.attr("class","dividers")	
	    		.attr('x1', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('x2', function(d, i) { return (((i*(bar_width+bar_padding)))+40);})
	    		.attr('y1', 0)
	    		.attr('y2', h);
    		}
    	
			//draw extended ticks (horizontal)
	    	var ticks = svg.selectAll('.ticky')
		    	.data(yScale.ticks(3))
    			.enter()
    				.append('svg:g')
    				.attr('transform', function(d) {
	      				return "translate(0, " + (yScale(d)) + ")";
	    			})
    				.attr('class', 'ticky')
	    		.append('svg:line')
	    			.attr("stroke-dasharray","1,3")
    				.attr('y1', 0)
	    			.attr('y2', 0)
    				.attr('x1', 8)
    				.attr('x2', w);
    				
    		//remove spacers
		    $(".spacer").hide();
		});
}

function assignEventListeners() {
	$("#hos_data .content svg").on("click", function() {
		d3.selectAll("#hos_data .content .bars")
			.style('fill', "#CDD7B6");
			
		//d3.selectAll(".bars_democracy")
		//	.style('fill', "#f1f1f1");

	    $("#country_name_big #content").html("");
	    $("#country_name_big #sparklines #content_plot").html("");
	    $("#country_name_big #sparklines").hide();
	    $("#seperator").css("border-left-width", "0px");
	});
	
	$("#hos_data .content2 svg").on("click", function() {
		d3.selectAll("#hos_data .content2 svg .bars")
	    	.style('fill', "#CDD7B6");
	    			
	    d3.selectAll("#hos_data .content2 svg .bars_too_few_heads")
	    	.style('fill', "#e1e1e1");

	    $("#country_name_big2 #content2").html("");
	    $("#country_name_big2 #sparklines2 #content_plot2").html("");
	    $("#country_name_big2 #sparklines2").hide();
	    $("#seperator2").css("border-left-width", "0px");
	});
	
	$("#hos_data .content3 svg").on("click", function() {
		d3.selectAll("#hos_data .content3 svg .bars")
	    	.style('fill', "#CDD7B6");
	    			
	    d3.selectAll("#hos_data .content3 svg .bars_too_few_heads")
	    	.style('fill', "#e1e1e1");

	    $("#country_name_big3 #content3").html("");
	    $("#country_name_big3 #sparklines3 #content_plot3").html("");
	    $("#country_name_big3 #sparklines3").hide();
	    $("#seperator3").css("border-left-width", "0px");
	});

	$("#hos_data .content4 svg").on("click", function() {
		d3.selectAll("#hos_data .content4 svg .bars")
	    	.style('fill', "#CDD7B6");
	    			
	    d3.selectAll("#hos_data .content4 svg .bars_too_few_heads")
	    	.style('fill', "#e1e1e1");

	    $("#country_name_big4 #content4").html("");
	    $("#country_name_big4 #sparklines4 #content_plot4").html("");
	    $("#country_name_big4 #sparklines4").hide();
	    $("#seperator4").css("border-left-width", "0px");
	});
}

function addCommas(nStr) {
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getHumanSize(size) {
	var sizePrefixes = ' kmbtpezyxwvu';
	if(size <= 0) return '0';
	var t2 = Math.min(Math.floor(Math.log(size)/Math.log(1000)), 12);
	return (Math.round(size * 100 / Math.pow(1000, t2)) / 100) +
	//return (Math.round(size * 10 / Math.pow(1000, t2)) / 10) +
		sizePrefixes.charAt(t2).replace(' ', '');
}