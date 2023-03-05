import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import cyclistData from "./data/cyclistData.js";

function dateFromMmssString(str) {
  let date = new Date();
  const [minutes, seconds] = str.split(":");
  date.setHours(0);
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  //console.log(date);
  return date;
}

const dataset = cyclistData;
const h = 600;
const xPadding = 40;
const yPadding = 40;
const w = 600;

const xScale = d3
  .scaleLinear()
  .domain([d3.min(dataset, (d) => d.Year) - 1, d3.max(dataset, (d) => d.Year)])
  .range([xPadding, w - xPadding]);

const yScale = d3
  .scaleTime()
  .domain([
    d3.min(dataset, (d) => {
      // This sets the domain minimum as 15 seconds faster than fastest time
      const date = dateFromMmssString(d.Time);
      date.setTime(date.getTime() - 1000 * 15);
      return date;
    }),
    d3.max(dataset, (d) => dateFromMmssString(d.Time)),
  ])
  .range([h - yPadding, yPadding]);

const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".4"));

const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

const svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

svg
  .append("g")
  .attr("transform", `translate(0,${h - yPadding})`)
  .attr("id", "x-axis")
  .call(xAxis);

svg
  .append("g")
  .attr("transform", `translate(${xPadding}, 0)`)
  .attr("id", "y-axis")
  .call(yAxis);

svg
  .selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("cx", (d) => xScale(d.Year))
  .attr("cy", (d) => yScale(dateFromMmssString(d.Time)))
  .attr("r", 8)
  .attr("width", Math.floor(w / dataset.length))
  .attr("class", "dot")
  .attr("data-xvalue", (d) => d.Year)
  .attr("data-yvalue", (d) => dateFromMmssString(d.Time))
  .attr("fill", (d) => (d.Doping ? "red" : "green"));

const tooltip = d3
  .select("body")
  .data(dataset)
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

svg
  .selectAll("circle")
  .on("mouseover", (_, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(
      `${d.Name}, ${d.Year}<br>${d.Time}<br>${
        d.Doping ? d.Doping : "No doping allegations."
      }`
    );
    tooltip.attr("data-year", d.Year);
    tooltip
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY + 20 + "px");
  })
  .on("mouseout", (d) => {
    tooltip.transition().duration(400).style("opacity", 0);
  });
