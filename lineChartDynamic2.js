function lineChartDynamic2() {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 30, left: 90 },
    width = 963 - margin.left - margin.right,
    height = 370 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#line-chart-dynamic-container2")
    .append("svg")
    .attr("id", "line-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Initialise X axis:
  const x = d3.scaleLinear().range([0, width]);
  const xAxis = d3.axisBottom(x).ticks(15).tickFormat(d3.format("d"));
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "myXaxis");

  // Initialize Y axis
  const y = d3.scaleLinear().range([height, 0]);
  const yAxis = d3.axisLeft(y);
  svg.append("g").attr("class", "myYaxis");

  //Add Y axis label
  svg
    .append("text")
    .attr("class", "lineYlabel")
    .attr("transform", "rotate(-90)")
    .attr("y", 5 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle");
  // Create the circle that travels along the curve of chart
  var focus = svg
    .append("g")
    .append("circle")
    .style("fill", "none")
    .attr("stroke", "steelblue")
    .attr("r", 8.5)
    .style("opacity", 0);
  // Create the text that travels along the curve of chart
  var focusText = svg
    .append("g")
    .append("text")
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle");

  // Add country label
  svg.append("text").attr("class", "countryLabel").attr("x", 40).attr("y", 40);

  return { margin, width, height, svg, x, xAxis, y, yAxis, focus, focusText };
}

export default lineChartDynamic2;
