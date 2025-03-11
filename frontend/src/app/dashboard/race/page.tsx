"use client";

import React, { useEffect, useRef, useState } from "react";

import * as d3 from "d3";

import styles from "./race.module.css";

interface DataItem {
  date: string;
  name: string;
  value: number;
}

const BarChartRace: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<any>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Group and process the data
  const processedData = React.useMemo(() => {
    // Group data by date
    const groupedByDate = d3.group(data, (d) => d.date);
    // Get sorted unique dates
    const dates = Array.from(groupedByDate.keys()).sort();

    return { groupedByDate, dates };
  }, [data]);

  useEffect(() => {
    // Create sample data if needed
    const sampleData: DataItem[] = [
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

    setData(sampleData);
  }, []);

  // Initialize the chart once
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 50, right: 160, bottom: 30, left: 180 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the chart group
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create date display
    const dateText = chart
      .append("text")
      .attr("class", "date")
      .attr("x", width - 50)
      .attr("y", -20)
      .attr("text-anchor", "end")
      .style("font-size", "24px")
      .style("font-weight", "bold");

    // Create scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.2);

    // Create axes
    const xAxis = chart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`);

    const yAxis = chart.append("g").attr("class", "y-axis");

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Store all chart elements in the ref for updates
    chartRef.current = {
      svg,
      chart,
      dateText,
      x,
      y,
      xAxis,
      yAxis,
      color,
      width,
      height,
    };
  }, [data.length > 0]);

  // Update chart when date changes
  useEffect(() => {
    if (!chartRef.current || processedData.dates.length === 0) return;

    const currentDate = processedData.dates[currentDateIndex];
    const currentData = processedData.groupedByDate.get(currentDate) || [];

    const { chart, dateText, x, y, xAxis, yAxis, color, width } =
      chartRef.current;

    // Sort data by value in descending order
    const sortedData = [...currentData].sort((a, b) => b.value - a.value);

    // Update date display
    dateText.text(currentDate);

    // Update scales
    const maxValue = d3.max(sortedData, (d) => d.value) || 0;
    x.domain([0, maxValue * 1.1]); // Add 10% padding
    y.domain(sortedData.map((d) => d.name));

    // Update x-axis with transition
    xAxis.transition().duration(750).call(d3.axisBottom(x).ticks(5));

    // Update y-axis with transition
    yAxis.transition().duration(750).call(d3.axisLeft(y));

    // Update bars with data join pattern
    const bars = chart.selectAll(".bar").data(sortedData, (d: any) => d.name);

    // Remove bars that no longer exist
    bars.exit().transition().duration(750).attr("width", 0).remove();

    // Add new bars
    const enterBars = bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => y(d.name) || 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", (d) => color(d.name) as string);

    // Update all bars (existing + new)
    enterBars
      .merge(bars as any)
      .transition()
      .duration(750)
      .attr("y", (d) => y(d.name) || 0)
      .attr("width", (d) => x(d.value))
      .attr("height", y.bandwidth());

    // Update labels
    const labels = chart
      .selectAll(".label")
      .data(sortedData, (d: any) => d.name);

    // Remove labels that no longer exist
    labels.exit().transition().duration(750).style("opacity", 0).remove();

    // Add new labels
    const enterLabels = labels
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.value) + 5)
      .attr("y", (d) => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("opacity", 0)
      .text((d) => d3.format(",.0f")(d.value));

    // Update all labels (existing + new)
    enterLabels
      .merge(labels as any)
      .transition()
      .duration(750)
      .attr("x", (d) => x(d.value) + 5)
      .attr("y", (d) => (y(d.name) || 0) + y.bandwidth() / 2)
      .style("opacity", 1)
      .textTween(function (d) {
        const i = d3.interpolate(this._previousValue || 0, d.value);
        this._previousValue = d.value;
        return (t) => d3.format(",.0f")(i(t));
      });
  }, [processedData, currentDateIndex]);

  // Set up animation interval
  useEffect(() => {
    if (!isPlaying || processedData.dates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentDateIndex((prev) => (prev + 1) % processedData.dates.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, processedData.dates.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={styles.container}>
      <h1>Music Chart Rankings</h1>
      <div className={styles.controls}>
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <span className={styles.dateDisplay}>
          {processedData.dates[currentDateIndex] || ""}
        </span>
      </div>
      <svg ref={svgRef} width="800" height="500"></svg>
    </div>
  );
};

export default BarChartRace;
