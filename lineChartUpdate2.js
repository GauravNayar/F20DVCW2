import lineChartDynamic2 from "./lineChartDynamic2.js";

const { margin, width, height, svg, x, xAxis, y, yAxis, focus, focusText } =
  lineChartDynamic2();

// Define default values for selectedCountry and selectedVar
//let currentCountry = "India";
//let currentVar = "total_cases";
let currentCountry = "IND";
let currentVar = "primary_energy_consumption";

function updateLineChart2(selectedCountry, selectedVar) {
  // To handle cases when selected country or selected variable is changed
  if (selectedCountry) {
    currentCountry = selectedCountry;
  } else {
    selectedCountry = currentCountry;
  }
  if (selectedVar) {
    currentVar = selectedVar;
  } else {
    selectedVar = currentVar;
  }

  d3.csv(
    "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv",
    // format and filter variables:
    function (d) {
      return {
        date: d.year,
        value: d[selectedVar],
        location: d.iso_code,
        country: d.country,
      };
    }
  ).then(function (data) {
    // set the specific date
    //const specificDate = new Date("2023-03-7");
    console.log("before: ", data);
    // filter the data based on the location upto recent date
    data = data.filter(
      (d) => d.location === selectedCountry && d.value !== ""
      //d.date <= specificDate
    );
    console.log("after: ", data);
    // Create the X axis:
    x.domain(d3.extent(data, (d) => d.date));
    svg.selectAll(".myXaxis").transition().duration(3000).call(xAxis);

    // create the Y axis
    y.domain([0, d3.max(data, (d) => +d.value * 1.15)]);
    svg.selectAll(".myYaxis").transition().duration(3000).call(yAxis);

    let lineYlabel = selectedVar;
    lineYlabel = lineYlabel.replace(/_/g, " ");
    lineYlabel =
      lineYlabel.charAt(0).toUpperCase() + lineYlabel.slice(1) + "(in TWh/KWh)";

    // update labels
    // Add Y-axis label
    svg.select(".lineYlabel").transition(1000).text(lineYlabel);

    const countryIndex = data.findIndex((d) => d.location === selectedCountry);
    // Add country label
    svg
      .select(".countryLabel")
      .transition(1000)
      .text(data[countryIndex].country);

    // Create a update selection: bind to the new data
    const u = svg.selectAll(".plotline").data([data], function (d) {
      return d.value;
    });
    // Update the line
    u.join("path")
      .attr("class", "plotline")
      .transition()
      .duration(3000)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.value);
          })
      )
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2.5);

    // Append an invisible overlay path to the SVG to handle mouse events
    svg.selectAll(".overlay").remove();

    const overlay = svg
      .append("path")
      .datum(data)
      .attr("class", "overlay")
      .attr("stroke", "transparent")
      .attr("stroke-width", 25)
      .attr("fill", "none")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.value);
          })
      )
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    // create a formatter with comma separator
    const formatter = d3.format(",d");

    // Mouse events
    function mouseover() {
      focus.style("opacity", 1);
      focusText.style("opacity", 1);
      //d3.select(".plotline").attr("stroke-width", 5);
    }
    function mousemove(event) {
      // recover coordinate we need
      const mouseX = x.invert(d3.pointer(event)[0]);
      const bisect = d3.bisector((d) => d.date).left;
      const i = bisect(data, mouseX, 1);
      const selectedData = data[i - 1];
      focus.attr("cx", x(selectedData.date)).attr("cy", y(selectedData.value));
      focusText
        .text(`Amount: ${formatter(selectedData.value)}`)
        .attr("x", x(selectedData.date) + 10)
        .attr("y", y(selectedData.value) - 10);
    }
    function mouseout() {
      focus.style("opacity", 0);
      focusText.style("opacity", 0);
      //d3.select(".plotline").attr("stroke-width", 1);
    }
  });
}

export default updateLineChart2;
