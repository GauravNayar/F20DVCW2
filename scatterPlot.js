import { dispatcher } from "./updateBarChart.js";
import { dispatcher2 } from "./updateBarChart2.js";
import { dispatcherBub } from "./bubbleMap.js";
import { scatDispatcher2 } from "./scatterPlot2.js";

// Create a dispatcher for highlight scatter plot event
export const scatDispatcher = d3.dispatch("scatHighlight", "scatUnhighlight");

function scatterPlot() {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 10, bottom: 50, left: 70 },
    width = 500 - margin.left - margin.right,
    height = 404 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#scatter-plot-container")
    .append("svg")
    .attr("id", "scatter-plot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Read csv data
  d3.csv(
    "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv",
    // format and filter variables:
    function (d) {
      return {
        date: d.year,
        value1: d.renewables_consumption,
        value2: d.renewables_share_energy,
        country: d.country,
        code: d.iso_code,
      };
    }
  ).then((data) => {
    console.log(data);
    // set the specific date
    const specificDate = "2021";
    // filter the data based on the location upto recent date
    data = data.filter(
      (d) =>
        (d.country === "India" ||
          d.country === "United States" ||
          d.country === "United Kingdom" ||
          d.country === "Germany" ||
          d.country === "Japan" ||
          d.country === "China" ||
          d.country === "Brazil" ||
          d.country === "New Zealand" ||
          d.country === "Russia") &&
        d.value1 !== "" &&
        d.value2 !== "" &&
        d.date === specificDate
    );
    console.log("After: ", data);
    // Initialize the X axis
    const x = d3.scaleLinear().range([0, width]);
    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);

    // X axis
    x.domain([
      d3.min(data, (d) => Math.max(+d.value1, 1)),
      d3.max(data, (d) => +d.value1 * 1.4),
    ]);
    xAxis.transition().duration(2000).call(d3.axisBottom(x).ticks(7));

    // Add X axis label
    svg
      .append("text")
      .attr("class", "scatXlabel")
      .attr("y", height + margin.bottom / 2)
      .attr("x", width / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Renewable Energy Consumption(Linear Scale)");

    // Initialize the Y axis
    const y = d3.scaleLinear().range([height, 0]);
    const yAxis = svg.append("g").attr("class", "myYaxis");

    // Add Y axis
    y.domain([
      d3.min(data, (d) => Math.max(+d.value2)),
      d3.max(data, (d) => +d.value2 * 1.15),
    ]);
    yAxis.transition().duration(2000).call(d3.axisLeft(y));

    // Add Y axis label
    svg
      .append("text")
      .attr("class", "scatYlabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 8 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Renewable Energy Share(Linear Scale)");

    // Color scale
    const color = d3
      .scaleOrdinal()
      .domain([
        "Germany",
        "India",
        "Japan",
        "United Kingdom",
        "United States",
        "China",
        "Brazil",
        "Russia",
        "New Zealand",
      ])
      .range([
        "green",
        "orange",
        "red",
        "purple",
        "blue",
        "yellow",
        "gray",
        "black",
        "violet",
      ]);

    // create a formatter with comma separator
    const formatter = d3.format(",d");

    // create tooltip
    const Tooltip = d3
      .select("#scatter-plot-container")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute");

    // Mouse events
    function mouseover(event, d) {
      Tooltip.style("opacity", 1);

      d3.select(this)
        .style("opacity", 1)
        .attr("r", 12)
        .style("stroke", "black")
        .style("stroke-width", "3");

      dispatcher.call("barHighlight", null, d); // Highlight bar in bar chart
      dispatcher2.call("barHighlight2", null, d); // Highlight bar in bar chart
      dispatcherBub.call("bubHighlight", null, d); // Hightlight bubble in bubble map
      scatDispatcher2.call("scatHighlight2", null, d);
    }
    const mousemove = (event, d) => {
      var mouseX = d3.pointer(event)[0]; // X coordinate of mouse
      var mouseY = d3.pointer(event)[1]; // Y coordinate of mouse

      Tooltip.html(
        d.country + "<br>" + "Share: " + formatter(d.value2) + "%" // Tooltip content
      )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 40 + "px");
    };

    function mouseleave(event, d) {
      Tooltip.style("opacity", 0);
      d3.select(this).style("opacity", 0.5).attr("r", 8).style("stroke", null);

      dispatcher.call("barUnhighlight", null, d); // unHighlight bar in bar chart
      dispatcher2.call("barUnhighlight2", null, d); // unHighlight bar in bar chart
      dispatcherBub.call("bubUnhighlight", null, d); // unHightlight bubble in bubble map
      scatDispatcher2.call("scatUnhighlight2", null, d);
    }

    // Add brushing
    svg.call(
      d3
        .brush()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("start brush", (event) => updateChart(event)) // Pass event as an argument
    );

    // Add dots
    const myCircle = svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.value1))
      .attr("cy", (d) => y(d.value2))
      .attr("r", 8)
      .attr("class", (d) => "scatter-plot " + d.country.replace(/\s+/g, "_"))
      .style("fill", (d) => color(d.country))
      .style("opacity", "0.5")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // Function that is triggered when brushing is performed
    function updateChart(event) {
      console.log(event.selection);
      let extent = event.selection;
      myCircle.classed("selected", function (d) {
        return isBrushed(extent, x(d.value1), y(d.value2));
      });
    }

    // A function that return TRUE or FALSE if a dot is in the selection or not
    function isBrushed(brush_coords, cx, cy) {
      var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This returns TRUE or FALSE depending on the points being in the selected area
    }

    const labelsGroup = svg.append("g").attr("class", "labelsGroup"); // Group element for label

    // Define a function to handle the "scatHighlight" event
    function onScatHighlight(d) {
      //Use find method to get corresponding data point in scatterplot
      const scatItem = data.find((item) => item.country === d.country);
      console.log(scatItem);
      // Set the opacity of all ".scatter-plot" elements to 0.5
      d3.selectAll(".scatter-plot").attr("opacity", 0.25);

      //Select correspoinding circle in scatter plot by country class
      const selectedScat = d3.select(
        ".scatter-plot." + d.country.replace(/\s+/g, "_")
      );
      console.log(selectedScat);
      // Set the opacity of the selected scatter plot circle to 1
      selectedScat
        .style("opacity", 1)
        .transition() // add a transition to animate the change in size
        .duration(200) // set the duration of the transition
        .attr("r", 12)
        .style("stroke", "black")
        .style("stroke-width", "1");

      // Coordinates of selected scatter plot circle
      const scatX = selectedScat.attr("cx");
      const scatY = selectedScat.attr("cy");

      // label box
      labelsGroup
        .append("rect")
        .attr("class", "scat-label-box")
        .attr("x", () => {
          return d.country === "Nigeria"
            ? x(scatItem.value1) + 12
            : d.country === "New Zealand" ||
              d.country === "Germany" ||
              d.country === "United Kingdom"
            ? x(scatItem.value1) - 73
            : x(scatItem.value1) - 44;
        })

        .attr("y", () => {
          return d.country === "United States"
            ? y(scatItem.value2) + 10
            : y(scatItem.value2) - 30;
        })

        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", 20)
        .attr("width", 95)
        .style("fill", "white")
        .style("stroke", "steelblue")
        .style("stroke-width", "2px");

      // label
      labelsGroup
        .append("text")
        .attr("class", "scat-label")
        .attr("x", () => {
          return d.country === "Nigeria"
            ? x(scatItem.value1) + 15
            : d.country === "New Zealand" ||
              d.country === "Germany" ||
              d.country === "United Kingdom"
            ? x(scatItem.value1) - 70
            : x(scatItem.value1) - 40;
        })

        .attr("y", () => {
          return d.country === "United States"
            ? y(scatItem.value2) + 26
            : y(scatItem.value2) - 15;
        })
        .text("Share: " + formatter(scatItem.value2) + "%");
    }

    // Define a function to handle the "scatUnhighlight" event
    function onScatUnhighlight(d) {
      d3.selectAll(".scatter-plot").attr("opacity", 0.5);
      d3.select(".scatter-plot." + d.country.replace(/\s+/g, "_"))
        .transition() // add a transition to animate the change in size
        .duration(200) // set the duration of the transition
        .attr("r", 8)
        .style("stroke", null);

      labelsGroup.select(".scat-label").remove();
      labelsGroup.select(".scat-label-box").remove();
    }

    // Add the event listener to the dispatcher
    scatDispatcher.on("scatHighlight", onScatHighlight);
    // Add the event listener to the dispatcher
    scatDispatcher.on("scatUnhighlight", onScatUnhighlight);
  });
}

export default scatterPlot;
