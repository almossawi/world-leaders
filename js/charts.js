function drawMultipleLines(data, container, format, y_value_name, multiplier) {
    var xMax = 0,
	    xMin = 0,
	    yMin = 0,
        yMax = 0,
        from = 0,
		to = data.json_data.length;
		
	//update dates (this is not needed if dates are received as timestamps)
	$.each(data.json_data, function(index_outer, value_outer) {
		//console.log("value outer (fx version): ");console.log(value_outer);
		$.each(value_outer.json_data, function(index_inner, value_inner) {
			//console.log("value inner (a data point for this version): ");console.log(value_inner);
			value_outer.json_data[index_inner].date = +new Date(value_inner.date);
		});
	});
	
	//get min/max for x/y for all versions
	$.each(data.json_data, function(index_outer, value_outer) {
		var xMaxThisVersion = d3.max(value_outer.json_data, function(d) { return d.date; });	
    	xMax = (xMaxThisVersion > xMax) ? xMaxThisVersion : xMax;
    	
    	var xMinThisVersion = d3.min(value_outer.json_data, function(d) { return d.date; });	
    	xMin = (xMinThisVersion < xMin || xMin == 0) ? xMinThisVersion : xMin;
    	
    	var yMaxThisVersion = d3.max(value_outer.json_data, function(d) { return (eval("d."+y_value_name)*multiplier); });	
    	yMax = (yMaxThisVersion > yMax) ? yMaxThisVersion : yMax;
    	
    	//var yMinThisVersion = d3.min(value_outer.json_data, function(d) { return (eval("d."+y_value_name)*multiplier); });	
    	//yMin = (yMinThisVersion < yMin || yMin == 0) ? yMinThisVersion : yMin;
	}); 

	var w = 320,
		h = 140,
		xPadding = 22,
		yPadding = 30,
		enter_animation_duration = 600;
	
	//we always use the div within the container for placing the svg
	container += " div";
	
	//for clarity, reassign
	var which_metric = container;
	    
    //prepare our scales and axes
   	var xScale = d3.time.scale()
            .domain([xMin, xMax])
            .range([xPadding+15, w-xPadding]);
            
    var yScale = d3.scale.linear()
            .domain([yMin, yMax])
            .range([h-yPadding, yPadding-6]);
            
    var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            //.tickFormat(d3.time.format(x_axis_format))
            .tickFormat(function(d, i) { return i+1; })
            .ticks(6);
            
	var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickFormat(d3.format(format))
            .ticks(5);
            
    //draw svg
	var svg = d3.select(container)
            .append("svg")
            .attr("width", w)
            .attr("height", h);
    
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(0," + (h-xPadding-10) + ")")
    	.call(xAxis);
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);
    	
    //add axis labels
    svg.append("text")
    	.text(function() {
    		if(container == "#chart_cos_weeks div") return "issue/ADI";
    	})
    	.attr("class", "axis_label")
    	.attr("transform", "rotate(90, " + xPadding + ",-20)")
    	.attr("x", 87)
    	.attr("y", 0);
    	
	svg.append("text")
    	.text("Week")
    	.attr("class", "axis_label")
    	.attr("x", function() { return (w / 2) - xPadding + 8; })
    	.attr("y", yPadding+107);
    	
    //draw extended ticks (horizontal)
    var ticks = svg.selectAll('.ticky')
    		.data(yScale.ticks(5))
    		.enter()
    			.append('svg:g')
    			.attr('transform', function(d) { return "translate(0, " + (yScale(d)) + ")"; })
    			.attr('class', function(d,i) { return (i == 0) ? "ticky_last" : "ticky"; })
    		.append('svg:line')
    			.attr('y1', 0)
    			.attr('y2', 0)
    			.attr('x1', yPadding+6)
    			.attr('x2', w-yPadding+9);
    
    //draw left y-axis
    svg.append('svg:line')
    	.attr('x1', yPadding+6)
    	.attr('x2', yPadding+6)
    	.attr('y1', yPadding-14)
    	.attr('y2', h-xPadding-8);
    
    //extended ticks (vertical)
    /*ticks = svg.selectAll('.tickx')
    	.d(xScale.ticks(10))
    	.enter()
    		.append('svg:g')
    			.attr('transform', function(d, i) {console.log(xScale(d));
				    return "translate(" + xScale(d) + ", 0)";
			    })
			    .attr('class', 'tickx');*/
	
	//draw y ticks
    ticks.append('svg:line')
    	.attr('y1', h-xPadding)
    	.attr('y2', xPadding)
    	.attr('x1', 0)
    	.attr('x2', 0);

    //y labels
    /*ticks
    	.append('svg:text')
    		.text(function(d) {
				return d;
			})
		.attr('text-anchor', 'bottom')
		.attr('dy', 125)
		.attr('dx', -4);
	*/

	//colors
	//var color = d3.scale.category20c();
	var color = d3.scale.ordinal()
		.domain(["0", "1", "2"])
		//.range(["#b8b8b8", "#818181", "#000000"]);
		.range(["#818181", "#818181", "#818181"]);
    	  
	//draw one or more lines
	$.each(data.json_data, function(index, data_version) {
		//since with the live data, we get full version numbers (e.g. 16.0 rather than 16)
		//console.log(Math.round(data_version.version));
		data_version.version = Math.round(data_version.version);
		
		//draw the line
		var line = d3.svg.line()
			.x(function(d){ return xScale(d.date)})
			.y(function(d){ return yScale((eval("d."+y_value_name)*multiplier))});
			//.interpolate("basis");

		var flat_line = d3.svg.line()
			.x(function(d){ return xScale(d.date)})
			.y(function(d){ 
				var max = d3.max(data_version.json_data);
				return yScale(eval("max."+y_value_name)*multiplier);
			})
			.interpolate("basis");

    	var paths = svg.append("svg:path")
	    	.attr('d', flat_line(data_version.json_data))      
	   		.attr('stroke', function(d) { return color(index); })
    		.attr("class", "the_glorious_line")
    		.transition()
	    		.duration(1000)
	    		.attr("d", line(data_version.json_data));

		//draw points if chart has one line
		var circle = svg.selectAll("circle.version" + data_version.version)
   			.data(data_version.json_data)
	   		.enter()
   				.append("circle")
   				//.attr('class','point')
	   			.attr('class', "version" + data_version.version)
   				.attr('fill', color(index))
   				.attr('opacity', 0)
   				.attr("cx", function(d) { return xScale(d.date); })
   				.attr("cy", function(d) { return yScale((eval("d."+y_value_name)*multiplier)); })
	   			.transition()
   				//.delay(function(d,i) { return i / data.json_data.length * enter_animation_duration})
   				.attr("r", 4);
   			
		svg.selectAll("circle")
			.on('mouseover.tooltip', function(d) {
				d3.selectAll(".tooltip").remove(); //timestamp is used as id
				d3.select(which_metric + " svg")
					.append("svg:rect")
						.attr("width", 45)
						.attr("height", 15)
						.attr("x", xScale(d.date)-22)
						.attr("y", yScale((eval("d."+y_value_name)*multiplier))-25)
						.attr("class", "tooltip_box");
						
				d3.select(which_metric + " svg")
					.append("text")
						.text(function() { return getHumanSize(eval("d."+y_value_name)*multiplier); })
						//.text(getHumanSize((eval("d."+y_value_name)*multiplier)))
						.attr("x", xScale(d.date))
						.attr("y", yScale((eval("d."+y_value_name)*multiplier))-13)
						.attr("id", d.date)
						.attr("dy", "0.35m")
						.attr("text-anchor", "middle")
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
			    	.attr('r', 9);
			}).on('mouseout', function() {
      			d3.select(this)
					.transition()
				   	.attr('r', 4);
      		})
			.append("text")
				.text(function(d) { return getHumanSize(eval("d."+y_value_name)*multiplier); })
			.attr('class', 'line_label')
			.attr("x", function(d) { return xScale(d.date)-5; })
			.attr("y", function(d) { return yScale((eval("d."+y_value_name)*multiplier)); });
	});
}


function drawCostOfSupportReleases(data, container, format, multiplier) {
	var w = 320,
		h = 140,
		xPadding = 22,
		yPadding = 30,
		enter_animation_duration = 600;
	
	//we always use the div within the container for placing the svg
	container += " div";
	
	//for clarity, we reassign
	var which_metric = container;
	
	console.log(d3.entries(data));
    //prepare our scales and axes
    var xMax = $("#release_latest").html(), //eg. version "17"
	    xMin = $("#release_latest").html() - 5,
	    yMin = d3.min(d3.entries(data), function(d) { return (d.value*multiplier); }),
        yMax = d3.max(d3.entries(data), function(d) { return (d.value*multiplier); });
        
   	var xScale = d3.scale.linear()
        .domain([xMin, xMax])
        .range([xPadding+36, w-xPadding-20]);

    var yScale = d3.scale.linear()
        .domain([0, yMax])
        .range([h-yPadding, yPadding-6]);
            
    var xAxis = d3.svg.axis()
        .scale(xScale)
    	.orient("bottom")
        .tickFormat(d3.format(".2r"))
        .ticks(6);
            
	var yAxis = d3.svg.axis()
        .scale(yScale)
    	.orient("left")
        .tickFormat(d3.format(format))
        .ticks(5);
            
    //draw svg
	var svg = d3.select(container)
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(-2," + (h-xPadding-10) + ")")
    	.call(xAxis);
    	
    //add axis labels
    svg.append("text")
    	.text("Visits/ADI (avg)")
    	.attr("class", "axis_label")
    	.attr("transform", "rotate(90, " + xPadding + ",-20)")
    	.attr("x", 77)
    	.attr("y", 0);
    	
	svg.append("text")
    	.text("Release")
    	.attr("class", "axis_label")
    	.attr("x", function() { return (w / 2) - xPadding + 9;})
    	.attr("y", yPadding+107);
    	    	
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);
    	
    //draw extended ticks (horizontal)
    var ticks = svg.selectAll('.ticky')
    	.data(yScale.ticks(6))
    	.enter()
    		.append('svg:g')
    		.attr('transform', function(d) { return "translate(0, " + (yScale(d)) + ")"; })
    		.attr('class', function(d,i) { return (i == 0) ? "ticky_last" : "ticky"; })
    	.append('svg:line')
    		.attr('y1', 0)
    		.attr('y2', 0)
    		.attr('x1', yPadding+6)
    		.attr('x2', w-yPadding+8);
    
    //draw left y-axis
    svg.append('svg:line')
    	.attr('x1', yPadding+6)
    	.attr('x2', yPadding+6)
    	.attr('y1', yPadding-14)
    	.attr('y2', h-xPadding-8);
    	
	//draw bars
	var bar = svg.selectAll("rect")
   		.data(d3.entries(data))
   		.enter()
   			.append("rect")
   			.attr('class','bar')
   			.attr('opacity', 1)
   			.attr('fill', function(d) { return "#000000"; })
   			.attr("x", function(d, i) { return xScale(d.key)-6; })
   			.attr("y", function(d) { return h-yPadding; })
   			.attr("height", function(d) { return 0; })
   			.attr("width", 10)
   			.transition()
   			.duration(1000)
   				.attr("y", function(d) { return yScale((d.value*multiplier)); })
   				.attr("height", function(d) {
    	    		return (h-yPadding) - yScale((d.value*multiplier));
	   			});
	   			
	svg.selectAll("rect")
		.on('mouseover.tooltip', function(d) {
			d3.selectAll(".tooltip").remove(); //timestamp is used as id
			d3.select(which_metric + " svg")
				.append("svg:rect")
					.attr("width", 40)
					.attr("height", 15)
					.attr("x", xScale((d.value*multiplier))-22)
					.attr("y", yScale((d.value*multiplier))-25)
					.attr("class", "tooltip_box");
						
			d3.select(which_metric + " svg")
				.append("text")
					.text(function() { return getHumanSize(d.value*multiplier); })
					.attr("x", xScale(d.key))
					.attr("y", yScale((d.value*multiplier))-13)
					//.attr("id", d.name)
					.attr("dy", "0.35m")
					.attr("text-anchor", "middle")
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
		.append("text")
			.text(function(d) { return getHumanSize(d.value*multiplier); })
		.attr('class', 'line_label')
		.attr("x", function(d) { return xScale(d.key)-5; })
		.attr("y", function(d) { return h-yScale((d.value*multiplier)); });
}