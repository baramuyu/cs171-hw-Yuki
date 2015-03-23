PrioVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    // defines constants
    this.margin = {top: 20, right: 0, bottom: 20, left: 20},
    this.width = 750 - this.margin.left - this.margin.right,
    this.height = 440 - this.margin.top - this.margin.bottom;

    this.initVis();

}

PrioVis.prototype.initVis = function(){

    var that = this; 

    // construct or select SVG
    this.svg = this.parentElement

    // creates axis and scales
    // this.x = d3.scale.ordinal()
    //     .rangeRoundBands([0, this.width]);
    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, this.width-100],.1);

    this.y = d3.scale.linear()
        .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .ticks(16);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(70," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(50,5)")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Distribution of priorities");

    // filter, aggregate, modify data
    this.wrangleData(this.data, null, null);

    this.x.domain(this.displayData.map(function(d) { return d.title; })); 
    this.y.domain(d3.extent(this.displayData, function(d) { return d.count; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    var g = this.svg.append("g")
      .attr("transform", "translate(55,0)");

    // Groups for countries
    groups = g
      .attr("class", "gParent")
      .selectAll("g.group")
      .data(this.displayData, function(d){return d.title})

    // Create a group for each country
    groups_enter = groups.enter()
      .append("g")
      .attr("class", "group")
      .attr("transform", function(d) { 
        return "translate(" + that.x(d.title) +", 0)"; 
      });

    // Bar details
    bars = groups_enter
      .append("rect")
      .attr("class","rect");

    // call the update method
    //this.updateVis();
}

PrioVis.prototype.wrangleData= function(_filterFunction, start, end){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction, start, end);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
}

PrioVis.prototype.updateVis = function(){

    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};


    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs
    // TODO: implement update graphs (D3: update, enter, exit)
    // updates scales

    that = this;

    // Data updates
    groups = d3.selectAll("g.group")
    	.data(this.displayData, function(d){
    		console.log(d.title)
    		return d.title});

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    // Groups update
    //this.y.domain(d3.extent(this.displayData, function(d) { return d; }));
    this.y.domain([0,d3.max(this.displayData.map(function(d){return d.count}))])

    // updates graph
	groups.selectAll("rect")
      //.style("fill", function(d,i){ return color(d.continent) })
      .transition().duration(200)
      .attr("x", function(d) { return that.x(d.title); })
      .attr("width", that.width / 20)
      .attr("y", function(d) { 
      	console.log(d)
      	return that.y(d.count); })
      .attr("height", function(d) {return that.height - that.y(d.count); });

    console.log("max", d3.max(this.displayData.map(function(d){return d.count})))
    console.log("scale-max",that.height - that.y(d3.max(this.displayData.map(function(d){return d.count}))))

}

PrioVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function
    this.wrangleData(this.data,selectionStart,selectionEnd)

    this.updateVis();

}

PrioVis.prototype.filterAndAggregate = function(_filter,start,end){

    // create an array of values for age 0-100
    var res = d3.range(16).map(function () {
		return {
			title: "", 
			count: 0
		}; 
    });

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
        filter = _filter;

    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}
        filter = filter.filter(function(d){ 
        	if (start == null)
        		return d;
        	else
            	return start <= d.time && d.time <= end;
        })

    var that = this;

    // accumulate all values that fulfill the filter criterion
    // TODO: implement the function that filters the data and sums the values
    filter.forEach(function(d){
    	var prioLen = d.prios.length;
        for (var i = 0; i <= prioLen - 1 ; i++) {
            res[i].count += d.prios[i];
        };
    })

    //apply title
    i = 0;
    while(i < 16){
    	res[i].title = that.metaData.priorities[i]["item-title"]
    	i++;
    }

    console.log("prios,", res);

    return res;
}