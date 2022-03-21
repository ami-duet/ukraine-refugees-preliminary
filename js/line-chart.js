const margin = {top: 100, right: 200, bottom: 100, left: 200};
const width = 1500;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Load data
d3.json("https://data2.unhcr.org/population/get/timeseries?widget_id=286725&sv_id=54&population_group=5460&frequency=day&fromDate=1900-01-01")
  .then(response => {
    // Format dataset
    const data = [];
    let previousTotal = 0;
    response.data.timeseries.forEach(d => {
      const dailyInfo = {
        date: new Date(d.data_date),
        individuals_total: d.individuals,
        individual_daily: d.individuals - previousTotal
      }
      previousTotal = d.individuals;
      data.push(dailyInfo);
    });

    buildLineChart(data);
  });

// Build line chart
const buildLineChart = (data) => {
  console.log("data", data);

  // Append containers
  const svg = d3.select("#refugees-per-day")
    .append("svg")
      .attr("viewBox", `0, 0, ${width}, ${height}`);

  const innerChart = svg
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Declare scales
  const xScale = d3.scaleTime()
    .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.individual_daily)])
    .range([innerHeight, 0]);

  // Append chart
  const curveGenerator = d3.area()
    .x(d => xScale(d.date))
    .y0(yScale(0))
    .y1(d => yScale(d.individual_daily))
    .curve(d3.curveCardinal);

  const lineChart = innerChart
    .append("path")
      .attr("class", "line-chart")
      .attr("d", curveGenerator(data))
      .attr("fill", "#843E36")
      .attr("fill-opacity", 0.48);

  
  // Append x-axis
  const bottomAxis = d3.axisBottom(xScale)
    .tickValues(data.map(d => d.date))
    .tickSize(innerHeight * -1);
  const axis = innerChart
    .append("g")
      .attr("class", "axis-x")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(bottomAxis);
  d3.selectAll(".axis-x text")
    .attr("y", "10px");


  // Get dates with inflection points
  const highlightedDates = [];
  data.forEach((d, i) => {
     if (i !== 0 && i !== data.length - 1 && d.individual_daily > data[i-1].individual_daily && d.individual_daily > data[i+1].individual_daily) {
      highlightedDates.push(d.date);
    }
  });
  highlightedDates.unshift(data[0].date);
  highlightedDates.push(data[data.length - 1].date);
  console.log("highlightedDates", highlightedDates);


  // Append date labels
  const dateLabels = innerChart
    .append("g")
      .attr("class", "labels date-labels")
    .selectAll(".date-label")
    .data(highlightedDates)
    .join("text")
      .attr("class", "label date-label")
      .attr("transform", d => `translate(${xScale(d)}, ${innerHeight + 30})`);
  dateLabels
    .append("tspan")
      .text(d => d3.timeFormat("%b")(d))
      .attr("x", 0)
      .attr("text-anchor", "middle");
  dateLabels
    .append("tspan")
      .text(d => d3.timeFormat("%d")(d))
      .attr("x", 0)
      .attr("dy", 25)
      .attr("text-anchor", "middle");

  // Append number labels
  const numberLabels = innerChart
    .append("g")
      .attr("class", "labels number-labels")
    .selectAll(".number-label")
    .data(highlightedDates)
    .join("g")
      .attr("class", "label number-label");
  numberLabels
    .append("text")
      .text(d => d3.format(",")(data.find(day => day.date === d).individual_daily))
      .attr("x", d => xScale(d))
      .attr("y", d => yScale(data.find(day => day.date === d).individual_daily) - 45)
      .attr("text-anchor", "middle");
  numberLabels
    .append("line")
      .attr("x1", d => xScale(d))
      .attr("y1", d => yScale(data.find(day => day.date === d).individual_daily) - 35)
      .attr("x2", d => xScale(d))
      .attr("y2", d => yScale(data.find(day => day.date === d).individual_daily))
      .attr("stroke", "#7C5959");


};