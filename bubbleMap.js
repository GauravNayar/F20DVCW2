import updateLineChart from "./lineChartUpdate.js";
import { dispatcher } from "./updateBarChart.js";
import { dispatcher2 } from "./updateBarChart2.js";
import { scatDispatcher } from "./scatterPlot.js";
import { scatDispatcher2 } from "./scatterPlot2.js";

// Create a dispatcher for highlight bubble event
export const dispatcherBub = d3.dispatch("bubHighlight", "bubUnhighlight");

function bubbleMap() {
  // The svg
  let width = 1260;
  let height = 398;
  const svg = d3
    .select("#bubble-map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "bubble-map");

  // Map and projection
  const projection = d3
    .geoMercator()
    .center([5, 20])
    .scale(75)
    .translate([width / 2, height / 2]);

  // Load map data
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ).then(function (data) {
    // Draw the map
    svg
      .append("g")
      .selectAll("path")
      .data(data.features)
      .join("path")
      .attr("fill", "#292629")
      .attr("d", d3.geoPath().projection(projection))
      .style("stroke", "#fff");

    // Load csv data
    d3.csv(
      "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv",
      // format and filter variables:
      function (d) {
        return {
          date: d.year,
          value: d.share_global_co2,
          country: d.country,
        };
      }
    ).then((data) => {
      // set the specific date
      const specificDate = "2021";
      // filter the data based on the location upto recent date
      data = data.filter(
        (d) =>
          (d.country === "India" ||
            d.country === "United States" ||
            d.country === "United Kingdom" ||
            d.country === "Germany" ||
            d.country === "Brazil" ||
            d.country === "Russia" ||
            d.country === "New Zealand" ||
            d.country === "China" ||
            d.country === "Japan") &&
          d.value !== "" &&
          d.date === specificDate
      );

      // color scale
      const color = d3
        .scaleOrdinal()
        .domain(["A", "B", "C"])
        .range(["red", "green", "blue"]);

      // scale for bubble size
      const sizeScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => +d.value)]) // What's in the data
        .range([5, 20]); // Size in pixel

      // Create data for circles:
      const markers = [
        {
          country: "Germany",
          long: 10.4515,
          lat: 51.1657,
          size: data.find((d) => d.country === "Germany")?.value || 0,
        }, // Germany
        {
          country: "India",
          long: 78.9629,
          lat: 20.5937,
          size: data.find((d) => d.country === "India")?.value || 0,
        }, // India
        {
          country: "Japan",
          long: 138.2529,
          lat: 36.2048,
          size: data.find((d) => d.country === "Japan")?.value || 0,
        }, // Japan
        {
          country: "United Kingdom",
          long: -3.436,
          lat: 55.3781,
          size: data.find((d) => d.country === "United Kingdom")?.value || 0,
        }, // UK
        {
          country: "United States",
          long: -95.7129,
          lat: 37.0902,
          size: data.find((d) => d.country === "United States")?.value || 0,
        }, // US
        {
          country: "Brazil",
          long: -51.9253,
          lat: -14.235,
          size: data.find((d) => d.country === "Brazil")?.value || 0,
        }, // Brazil
        {
          country: "China",
          long: 104.1954,
          lat: 35.8617,
          size: data.find((d) => d.country === "China")?.value || 0,
        }, // Nigeria
        {
          country: "New Zealand",
          long: 174.886,
          lat: -40.9006,
          size: data.find((d) => d.country === "New Zealand")?.value || 0,
        }, // New Zealand
        {
          country: "Russia",
          long: 105.3188,
          lat: 61.524,
          size: data.find((d) => d.country === "Russia")?.value || 0,
        }, // Russia
      ];

      console.log(markers);
      // create a formatter with comma separator
      const formatter = d3.format(",d");
      // create a tooltip
      const Tooltip = d3
        .select("#bubble-map-container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

      // Mouse events
      function mouseover(event, d) {
        console.log(d.country);
        d3.select(this)
          .attr("fill", "orange")
          .transition() // add a transition to animate the change in size
          .duration(200)
          .attr("r", (d) => sizeScale(d.size) + 5)
          .attr("stroke", "black")
          .attr("stroke-width", "3");
        Tooltip.style("opacity", 1); // Tooltip active

        dispatcher.call("barHighlight", null, d); // Highlight bar in bar chart
        dispatcher2.call("barHighlight2", null, d); // Highlight bar in bar chart
        scatDispatcher.call("scatHighlight", null, d); // Hightlight circle in scatter plot
        scatDispatcher2.call("scatHighlight2", null, d);
      }

      function mousemove(event, d) {
        var mouseX = d3.pointer(event)[0]; // X coordinate of mouse
        var mouseY = d3.pointer(event)[1]; // Y coordinate of mouse
        Tooltip.html(
          d.country + "<br>" + "Share of C02: " + formatter(d.size) + "%"
        ) // Tooltip content
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 40 + "px");
      }

      function mouseleave(event, d) {
        d3.select(this)
          .transition() // add a transition to animate the change in size
          .duration(200)
          .attr("r", (d) => sizeScale(d.size))
          .attr("stroke", null)
          .attr("fill", "red");
        Tooltip.style("opacity", 0); // Tooltip deactive
        dispatcher.call("barUnhighlight", null, d); // unHighlight bar in bar chart
        dispatcher2.call("barUnhighlight2", null, d); // unHighlight bar in bar chart
        scatDispatcher.call("scatUnhighlight", null, d); // unHightlight circle in scatter plot
        scatDispatcher2.call("scatUnhighlight2", null, d);
      }

      // const mouseclick = (event, d) => {
      //   let country = d.country;
      //   updateLineChart(country);
      // };

      // Add circles:
      svg
        .selectAll("circle")
        .data(markers)
        .join("circle")
        .attr("cx", (d) => projection([d.long, d.lat])[0])
        .attr("cy", (d) => projection([d.long, d.lat])[1])
        .attr("r", (d) => sizeScale(d.size))
        .attr("fill", "red")
        .attr("class", (d) => "bubble-map " + d.country.replace(/\s+/g, "_"))
        .attr("id", (d) => d.country)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      // Define a function to handle the "bubHighlight" event
      function onBubHighlight(d) {
        //Use find method to get corresponding data point in map
        const bubItem = markers.find((item) => item.country === d.country);

        // Set the opacity of all ".bubble-map" elements to 0.5
        d3.selectAll(".bubble-map").attr("opacity", 0.5);

        // Select correspoinding bubble by country class
        const selectedBub = d3.select(
          ".bubble-map." + d.country.replace(/\s+/g, "_")
        );
        // Set the opacity of the selected bubble to 1
        selectedBub
          .attr("opacity", 1)
          .transition() // add a transition to animate the change in size
          .duration(200)
          .attr("r", (d) => sizeScale(d.size) + 5)
          .attr("stroke", "black")
          .attr("stroke-width", "1");

        // bubble coordinates
        const bubX = selectedBub.attr("cx");
        const bubY = selectedBub.attr("cy");

        // label box
        svg
          .append("rect")
          .attr("class", "bub-label-box")
          .attr("x", () =>
            d.country === "New Zealand" ? bubX - 115 : bubX - 6
          )
          .attr("y", bubY - 25)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("height", 20)
          .attr("width", 140)
          .style("fill", "white")
          .style("stroke", "steelblue")
          .style("stroke-width", "2px");

        // label
        svg
          .append("text")
          .attr("class", "bub-label")
          .attr("x", () =>
            d.country === "New Zealand" ? bubX - 107 : bubX + 5
          )
          .attr("y", bubY - 10)
          .text("Share of CO2: " + formatter(bubItem.size) + "%");
      }

      // Define a function to handle the "bubUnhighlight" event
      function onBubUnhighlight(d) {
        console.log(d.country);
        d3.selectAll(".bubble-map").attr("opacity", 1);
        d3.select(".bubble-map." + d.country.replace(/\s+/g, "_"))
          .transition() // add a transition to animate the change in size
          .duration(200)
          .attr("r", (d) => sizeScale(d.size))
          .attr("stroke", false);

        svg.select(".bub-label").remove();
        svg.select(".bub-label-box").remove();
      }

      // Add the event listener to the dispatcher
      dispatcherBub.on("bubHighlight", onBubHighlight);
      // Add the event listener to the dispatcher
      dispatcherBub.on("bubUnhighlight", onBubUnhighlight);
    });
  });
}
export default bubbleMap;
