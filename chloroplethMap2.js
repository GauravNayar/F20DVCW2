import updateLineChart from "./lineChartUpdate.js";
import updateLineChart2 from "./lineChartUpdate2.js";
import { dispatcher } from "./updateBarChart.js";
import { scatDispatcher } from "./scatterPlot.js";

function chloroplethMap2() {
  // The svg
  let width = 500;
  let height = 364;
  const svg = d3
    .select("#chloro-map-container2")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "chloro-map2");
  // Map and projection
  const path = d3.geoPath();
  const projection = d3
    .geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

  // Data and color scale
  const data = new Map();
  const colorScale = d3
    .scaleThreshold()
    .domain([10, 100, 250, 500, 1000, 3000, 4000])
    .range(d3.schemeBlues[7]);

  // Load external data and boot
  Promise.all([
    d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ),
    d3.csv(
      "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv",
      function (d) {
        data.set(d.iso_code, +d.co2);
      }
    ),
  ]).then(function (loadData) {
    let topo = loadData[0];

    console.log(data);

    // create a tooltip
    const Tooltip = d3
      .select("#chloro-map-container2")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    function mouseover(event, d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 0.5);
      d3.selectAll("#" + d.id)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");
      Tooltip.style("opacity", 1); // Tooltip active
    }
    function mousemove(event, d) {
      var mouseX = d3.pointer(event)[0]; // X coordinate of mouse
      var mouseY = d3.pointer(event)[1]; // Y coordinate of mouse
      Tooltip.html(d.id) // Tooltip content
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 30 + "px");
    }

    function mouseleave(event, d) {
      d3.selectAll(".Country").transition().duration(200).style("opacity", 1);
      d3.selectAll("#" + d.id)
        .transition()
        .duration(200)
        .style("stroke", null);

      Tooltip.style("opacity", 0); // Tooltip deactive
    }

    const mouseclick = (event, d) => {
      let country = d.id;
      updateLineChart(country);
      updateLineChart2(country);
    };

    // Draw the map
    svg
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function (d) {
        return "Country";
      })
      .attr("id", function (d) {
        return d.id;
      })
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .on("mousemove", mousemove)
      .on("click", mouseclick);
  });
}

export default chloroplethMap2;
