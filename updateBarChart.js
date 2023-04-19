import barChart from "./barChart.js";
import { dispatcherBub } from "./bubbleMap.js";
import { scatDispatcher } from "./scatterPlot.js";
import { scatDispatcher2 } from "./scatterPlot2.js";

// import variables and create bar chart svg
const { margin, width, height, svg, x, xAxis, y, yAxis } = barChart();

// Create a dispatcher
export const dispatcher = d3.dispatch("barHighlight", "barUnhighlight");

function updateBarChart(selectedVar) {
  if (selectedVar == undefined) {
    selectedVar = "total_cases";
  }

  d3.csv(
    "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv",
    // format and filter variables:
    function (d) {
      return {
        date: d.year,
        value: d[selectedVar],
        country: d.country,
        code: d.iso_code,
      };
    }
  ).then(function (data) {
    console.log(selectedVar);
    console.log("BARDATA: ", data);
    // set the specific date
    const specificDate = "2019"; //Last date for data available on greenhouse gases
    // filter the data based on the location upto recent date
    data = data.filter(
      (d) =>
        (d.country === "India" ||
          d.country === "United States" ||
          d.country === "United Kingdom" ||
          d.country === "Germany" ||
          d.country === "China" ||
          d.country === "Australia" ||
          d.country === "Russia" ||
          d.country === "Brazil" ||
          d.country === "Japan") &&
        d.value !== "" &&
        d.date === specificDate
    );
    console.log("Bar DATA after: ", data);
    // X axis
    x.domain(data.map((d) => d.country));
    xAxis.transition().duration(2000).call(d3.axisBottom(x));
    // Add Y axis
    y.domain([0, d3.max(data, (d) => +d.value * 1.15)]);
    yAxis.transition().duration(2000).call(d3.axisLeft(y));

    let barYlabel = selectedVar;
    barYlabel = barYlabel.replace(/_/g, " ");
    barYlabel = barYlabel.charAt(0).toUpperCase() + barYlabel.slice(1);

    // Add Y-axis label
    svg.select(".barYlabel").text(barYlabel);

    // create a formatter with comma separator
    const formatter = d3.format(",d");
    // create a tooltip
    const Tooltip = svg
      .append("foreignObject")
      .attr("class", "tooltip")
      .style("pointer-events", "none") // Prevent the tooltip from capturing pointer events
      .style("opacity", 0);

    const TooltipContent = Tooltip.append("div")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // variable u: map data to existing bars
    const u = svg.selectAll("rect").data(data);
    // create bars for new data
    const bars = u
      .join("rect")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition() // add a transition to animate the change in size
          .duration(200) // set the duration of the transition
          .attr("width", x.bandwidth() + 10) // increase the width of the bar
          .attr("height", (d) => height - y(d.value) + 10) // increase the height of the bar
          .attr("y", (d) => y(d.value) - 10) // move the bar up to compensate for the increased height;
          .attr("x", (d) => x(d.country) - 5)
          .attr("stroke-width", "3");
        // svg
        //   .append("rect") //textbox
        //   .attr("class", "bar-label-background")
        //   .attr("x", () =>
        //     d.country === "United States" ? x(d.country) - 48 : x(d.country) - 5
        //   )
        //   .attr("y", y(d.value) - 30)
        //   .attr("width", 130)
        //   .attr("height", 20)
        //   .attr("fill", "white")
        //   .attr("stroke", "black")
        //   .attr("stroke-width", "2")
        //   .attr("rx", 5)
        //   .attr("ry", 5);

        // Display bar value on bar
        svg
          .append("text")
          .attr("class", "bar-label")
          .attr("x", () =>
            d.country === "" ? x(d.country) - 15 : x(d.country) - 5
          )
          .attr("y", y(d.value) - 15)
          .text(formatter(d.value));

        //Dispatcher events highlight
        dispatcherBub.call("bubHighlight", null, d);
        scatDispatcher.call("scatHighlight", null, d);
        scatDispatcher2.call("scatHighlight2", null, d);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("fill", function (d) {
            // Set color based on value
            if (d.value > 0.5 * d3.max(data, (d) => +d.value)) {
              return "red";
            } else if (d.value < 0.5 * d3.max(data, (d) => +d.value)) {
              return "green";
            } else {
              return "#69b3a2";
            }
          })
          .transition()
          .duration(200)
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.value))
          .attr("x", (d) => x(d.country))
          .attr("y", (d) => y(d.value))
          .attr("stroke-width", "2");
        svg.select(".bar-label").remove();

        //Dispatcher events unhighlight
        dispatcherBub.call("bubUnhighlight", null, d);
        scatDispatcher.call("scatUnhighlight", null, d);
        scatDispatcher2.call("scatUnhighlight2", null, d);
      })
      .transition()
      .duration(2000)
      .attr("x", (d) => x(d.country))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("class", (d) => "bar-chart " + d.country.replace(/\s+/g, "_"))
      .attr("stroke", "black")
      .attr("stroke-width", "2")
      .attr("fill", function (d) {
        console.log(typeof d.country);
        if (d.value > 0.5 * d3.max(data, (d) => +d.value)) {
          return "red";
        } else if (d.value < 0.5 * d3.max(data, (d) => +d.value)) {
          return "green";
        } else {
          return "#69b3a2";
        }
      });

    // Define a function to handle the "barHighlight" event
    function onBarHighlight(d) {
      // Use find method to get corresponding data point in bar chart
      const barItem = data.find((item) => item.country === d.country);

      // Set the opacity of all ".bar-chart" elements to 0.5
      d3.selectAll(".bar-chart").attr("opacity", 0.5);

      //Select correspoinding bar by country
      const selectedBar = d3.select(
        ".bar-chart." + d.country.replace(/\s+/g, "_")
      );
      // Set the opacity of the selected bar to 1
      selectedBar
        .attr("opacity", 1)
        .transition() // add a transition to animate the change in size
        .duration(200) // set the duration of the transition
        .attr("width", x.bandwidth() + 5) // increase the width of the bar
        .attr("height", (d) => height - y(barItem.value) + 5) // increase the height of the bar
        .attr("y", (d) => y(barItem.value) - 5) // move the bar up to compensate for the increased height;
        .attr("stroke-width", "3");

      // Bar coordinates
      const barX = selectedBar.attr("x");
      const barY = selectedBar.attr("y");

      // Display bar value on bar
      svg
        .append("text")
        .attr("class", "bar-label2")
        .attr("x", () =>
          d.country === "" ? x(barItem.country) - 15 : x(barItem.country) - 5
        )
        .attr("y", y(barItem.value) - 15)
        .text(formatter(barItem.value));
    }

    // Function to handle the "barUnhighlight" event
    function onBarUnhighlight(d) {
      // Use find method to get corresponding data point in bar chart
      const barItem = data.find((item) => item.country === d.country);
      console.log(barItem);
      d3.selectAll(".bar-chart").attr("opacity", 1);
      d3.select(".bar-chart." + d.country.replace(/\s+/g, "_"))
        .transition() // add a transition to animate the change in size
        .duration(200) // set the duration of the transition
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(barItem.value))
        .attr("y", (d) => y(barItem.value))
        .attr("stroke-width", "2");

      svg.select(".bar-label2").remove();
    }

    // Add the event listener to the dispatcher
    dispatcher.on("barHighlight", onBarHighlight);
    // Add the event listener to the dispatcher
    dispatcher.on("barUnhighlight", onBarUnhighlight);
  });
}

export default updateBarChart;
