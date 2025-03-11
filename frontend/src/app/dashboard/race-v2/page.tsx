"use client";

import React, { useEffect, useRef, useState } from "react";

import * as d3 from "d3";

const data = [
  { date: "2000-01-01", name: "Blinding Lights", value: 72537 },
  { date: "2000-01-01", name: "Shape of You", value: 65421 },
  { date: "2000-01-01", name: "Dance Monkey", value: 59087 },
  { date: "2000-01-01", name: "Someone You Loved", value: 53942 },
  { date: "2000-01-01", name: "One Dance", value: 47826 },
  { date: "2000-02-01", name: "Blinding Lights", value: 78234 },
  { date: "2000-02-01", name: "Dance Monkey", value: 67321 },
  { date: "2000-02-01", name: "Shape of You", value: 63987 },
  { date: "2000-02-01", name: "Someone You Loved", value: 52145 },
  { date: "2000-02-01", name: "One Dance", value: 48967 },
  { date: "2000-03-01", name: "Dance Monkey", value: 83456 },
  { date: "2000-03-01", name: "Blinding Lights", value: 81234 },
  { date: "2000-03-01", name: "Shape of You", value: 62879 },
  { date: "2000-03-01", name: "One Dance", value: 49321 },
  { date: "2000-03-01", name: "Someone You Loved", value: 51098 },
  { date: "2000-04-01", name: "Dance Monkey", value: 89764 },
  { date: "2000-04-01", name: "Blinding Lights", value: 83567 },
  { date: "2000-04-01", name: "One Dance", value: 57892 },
  { date: "2000-04-01", name: "Shape of You", value: 61234 },
  { date: "2000-04-01", name: "Someone You Loved", value: 50123 },
];

const BarChartRace = () => {
  const svgRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const width = 600;
  const height = 400;

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const updateChart = (index) => {
      const groupedData = data.filter((d) => d.date === data[index * 5].date);
      groupedData.sort((a, b) => b.value - a.value);

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(groupedData, (d) => d.value)])
        .range([0, width - 100]);

      const yScale = d3
        .scaleBand()
        .domain(groupedData.map((d) => d.name))
        .range([0, height - 50])
        .padding(0.1);

      const bars = svg.selectAll("rect").data(groupedData, (d) => d.name);

      bars
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d) => yScale(d.name))
        .attr("width", (d) => xScale(d.value))
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue")
        .merge(bars)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("width", (d) => xScale(d.value));

      bars
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("y", (d) => yScale(d.name));

      bars.exit().remove();

      const labels = svg.selectAll("text").data(groupedData, (d) => d.name);

      labels
        .enter()
        .append("text")
        .attr("x", (d) => xScale(d.value) + 5)
        .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text((d) => d.name)
        .merge(labels)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("x", (d) => xScale(d.value) + 5);

      labels
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2);

      labels.exit().remove();
    };

    updateChart(currentIndex);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (data.length / 5));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return <svg ref={svgRef}></svg>;
};

export default BarChartRace;
