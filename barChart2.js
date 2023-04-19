function barChart2() {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 10, bottom: 30, left: 90 },
    width = 963 - margin.left - margin.right,
    height = 404 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#bar-chart-container2")
    .append("svg")
    .attr("id", "bar-chart2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Initialize the X axis
  const x = d3.scaleBand().range([0, width]).padding(0.2);
  const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);

  // Initialize the Y axis
  const y = d3.scaleLinear().range([height, 0]);
  const yAxis = svg.append("g").attr("class", "myYaxis");

  // Add Y axis label
  svg
    .append("text")
    .attr("class", "barYlabel")
    .attr("transform", "rotate(-90)")
    .attr("y", 5 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle");

  return { margin, width, height, svg, x, xAxis, y, yAxis };
}
export default barChart2;
