var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return '<strong>Name: </strong> <span class="details">' + d.properties.NAME + '<br /></span> <strong>Labor Work Ratio: </strong> <span class="details">' + d.total + '</span>'; });

var data = d3.map();
var colorScheme = d3.schemeReds[5];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([0.3, 0.6, 0.9, 1.2, 1.5, 1.8])
    .range(colorScheme);
var xx,
	nest = {};
var svg = d3.select("body")
            .append("svg")
			.attr("class", "map")
            .attr("width", 350)
            .attr("height", 500);
/*
var x = d3.scaleBand()
          .range([0, 500])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([350, 0]);
		  */

var width = 210,
	height = 550;
var svgbar = d3.select("body")
		.append("svg")
		.attr("class", "bar")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(350,0)");

svg.call(tip);

d3.queue()
  .defer(d3.json,"indycounty.json")
  .defer(d3.csv,"in_out_2016.csv", function(d){
		d.LaborForce = +d.LaborForce;
		d.LabWorkRatio = +d.LabWorkRatio;
		d.Workforce = +d.Workforce;
	nest[d.description] = {name: d.description, labor: d.LaborForce, ratio: d.LabWorkRatio, work: d.Workforce};
	})//d3.csv
	.await(ready)

  function ready(error, countyMap){
    if (error) throw error;
	  
    var indyState = topojson.feature(countyMap, {
          type: "GeometryCollection",
          geometries: countyMap.objects.indycounty.geometries
      });

    var projection = d3.geoMercator()
        .fitExtent([[0, 0], [350, 500]],indyState);

    var geoPath = d3.geoPath()
                    .projection(projection);
  // Draw the map
var originalColor;
	 
 svg.append("g")
     .attr("class", "countries")
     .selectAll("path")
     .data(indyState.features)
     .enter().append("path")
     .attr("stroke","black")
     .attr("fill", function (d){
            d.total = data.get(d.properties.NAME) || 0;
	 		d.labor = data.get(d.properties.NAME);
	 		d.data = nest[d.properties.NAME];
            return colorScale(d.data.ratio);
        })
	  .attr("d", geoPath)
	  .on('mouseover', function(d){
	 		//tip.show(d);
	 		originalColor = d3.select(this).style("fill");
			d3.select(this)
				.style('fill', 'Turquoise');
		})
	  .on('click', function(d) {
	 	xx = -50;
	 	d3.selectAll("rect").remove();
	 	d3.selectAll("text").remove();
	 	tip.show(d);
	 	bar(d.data);
 		})
	  .on('mouseout', function(d){
	 		tip.hide();	
			d3.select(this)
				.style('fill', originalColor);
	  	});
  }

function bar(county)
{	
	//bars
	var barchart = svgbar.selectAll("rect")
		.data([county.labor, county.work])
		.enter()
		.append("rect")
		.style("fill", "cyan")
		.attr("x", function(){ xx += 100; return xx; })
      	.attr("width", 50)
      	.attr("y", function(d) {return height - d / 1500 - 30; })
      	.attr("height", function(d) { return d / 1500; })
	xx = -50;
	
	//quantity label
	svgbar.selectAll("text")
		.data([county.labor, county.work])
		.enter()
		.append("text")
		.attr("x", function(){ xx += 100; return xx; })
		.attr("y", function(d) {return height - d / 1500 - 30;})
		.attr("dy", "-5px")
		.text(function(d){ return d; });
	
	//title
	svgbar.append("text")
		.attr("x", width / 2)
		.attr("y", "1.1em")
		.text(county.name);
	
	//x axis label
	svgbar.append("text")
		.attr("x", 35)
		.attr("y", height)
		.text("Labor Force");
	svgbar.append("text")
		.attr("x", 135)
		.attr("y", height)
		.text("Work Force");
}
