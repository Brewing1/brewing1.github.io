// Adapted from:
//  - https://elliotbentley.com/blog/a-better-way-to-structure-d3-code/

const d3 = require("d3");

module.exports = class BarPlot {

  constructor(element, sampleData, options) {
    this.element = element;

    size = Math.min($(element).width(),$(element).height());
    this.width = size;
    this.height = size;
    this.margin = {top: 25, right: 20, bottom: 35, left: 40};

    this.numBars = 28;
    this.fullSampleData = sampleData;
    this.data = this.fullSampleData.hx_loadings[0].slice(0, this.numBars)

    this.useColor = true;

    this.draw();
  }


  draw() {    
    this.svg = d3.select(this.element)
      .append('svg')
      .attr("width", this.width)
      .attr("height", this.height);

    this._createScales();
    this._drawAxes();
    this._drawBars();
  }

  update(step, salType) {
    var colors;
    if (this.useColor) {
      const colorData = this.fullSampleData[`grad_hx_${salType}_loadings`];
      this._createColorScale(colorData);
      const curentColorData = colorData[step].slice(0, this.numBars);
      colors = d3.map(curentColorData, this.colorScale);
    }
    else {
      colors = Array(this.numBars).fill(["black"]);
    }
    const currentData = d3.zip(this.fullSampleData.hx_loadings[step], colors)

    this.svg.selectAll("rect")
      .data(currentData)
      .transition(10)
        .attr("y", (d) => (d[0]>0) ? this.y(d[0]) : this.y(0))
        .attr("height", d => Math.abs(this.y(0) - this.y(d[0])))
        .attr("fill", d => d[1])
  }

  // update(step) {
  //   this.data = this.fullSampleData.hx_loadings[step].slice(0, this.numBars)

  //   this.svg.selectAll("rect")
  //     .data(this.data)
  //     .transition(10)
  //       .attr("y", (d) => (d>0) ? this.y(d) : this.y(0))
  //       .attr("height", d => Math.abs(this.y(0) - this.y(d)))
  // }

  _2dTruncatedExtent(data_array) {
    const minVal = d3.min(data_array, d => d3.min(d.slice(0, this.numBars)));
    const maxVal = d3.max(data_array, d => d3.max(d.slice(0, this.numBars)));
    return [minVal, maxVal]
  }

  _createColorScale(colorData) {
    const extent = this._2dTruncatedExtent(colorData);
    maxExtent = Math.max(Math.abs(extent[0]), Math.abs(extent[1]))
    this.colorScale = d3.scaleDiverging([-maxExtent, 0, maxExtent], d3.interpolateRdBu);
  }

  _createScales() {
    m = this.margin

    this.x = d3.scaleBand()
      .domain(d3.range(this.numBars))
      .range([m.left, this.width - m.right])
      .padding(0.1);

    this.y = d3.scaleLinear()
      .domain(this._2dTruncatedExtent(this.fullSampleData.hx_loadings)).nice()
      .range([this.height - m.bottom, m.top]);

    console.log(this.y(5))
  }


  _drawAxes() {
    m = this.margin;

    xAxis = g => g
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .attr("class", "x axis")
      .call(d3.axisBottom(this.x).ticks(this.width / 80))
      .call(g => g.append("text")
        .attr("x", this.width)
        .attr("y", this.margin.bottom - 4)
        .attr("fill", "black")
        .attr("text-anchor", "end"));
    
    yAxis = g => g
      .attr("transform", `translate(${this.margin.left},0)`)
      .attr("class", "y axis")
      .call(d3.axisLeft(this.y))
      .call(g => g.append("text")
        .attr("x", - this.margin.left)
        .attr("y", 10)
        .attr("fill", "black")
        .attr("text-anchor", "start"));

    this.svg.append("g")
        .call(xAxis);

    this.svg.append("g")
        .call(yAxis);
  }


  _drawBars() {
  this.svg.append("g")
    .attr("fill", "black")
    .selectAll("rect")
    .data(this.data)
    .join("rect")
      .attr("x", (d, i) => this.x(i))
      .attr("y", (d) => (d>0) ? this.y(d) : this.y(0))
      .attr("height", d => Math.abs(this.y(0) - this.y(d)) )
      .attr("width", this.x.bandwidth());
  }
}
