"use client";

import React, { cache, use, useRef, useState } from "react";

import { client } from "@/axios";

import * as d3 from "d3";

import styles from "./race.module.css";

interface DataItem {
  date: string;
  name: string;
  points: number;
}

// Cache the data fetching function so multiple renders don't trigger multiple fetches
const fetchChartData = cache(async (): Promise<DataItem[]> => {
  const response = await client.get<DataItem[]>(
    "Records/GetRecordBasedOnCountryAndDateAndCalculateSongsPoints/dk",
  );
  return response.data;
});

const testPrimise = client.get<DataItem[]>(
  "Records/GetRecordBasedOnCountryAndDateAndCalculateSongsPoints/dk",
);

const DURATION = 1500;
export const BarChartRace: React.FC = () => {
  // Use the Suspense-compatible data fetching
  const { data } = use(testPrimise);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<any>(null);
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

  // Initialize the chart once
  React.useEffect(() => {
    if (!svgRef.current) return;

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
  }, []);

  // Update chart when date changes - keep the existing implementation
  React.useEffect(() => {
    if (!chartRef.current || processedData.dates.length === 0) return;

    const currentDate = processedData.dates[currentDateIndex];
    const currentData = processedData.groupedByDate.get(currentDate) || [];

    // Rest of your chart update code...
    const { chart, dateText, x, y, xAxis, yAxis, color, width } =
      chartRef.current;

    // Sort data by value in descending order
    const sortedData = [...currentData]
      .sort((a, b) => b.points - a.points)
      .slice(0, 15);

    // Update date display
    dateText.text(currentDate);

    // Update scales
    const maxValue = d3.max(sortedData, (d) => d.points) || 0;
    x.domain([0, maxValue * 1.1]); // Add 10% padding
    y.domain(sortedData.map((d) => d.name));

    // Update x-axis with transition and custom tick format
    xAxis
      .transition()
      .duration(DURATION)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => `${d3.format(",.0f")(51 - d)}`), // Convert points to rank
      );

    // Update y-axis with transition
    yAxis.transition().duration(DURATION).call(d3.axisLeft(y));

    // Update bars with data join pattern
    const bars = chart.selectAll(".bar").data(sortedData, (d: any) => d.name);

    // Remove bars that no longer exist
    bars.exit().transition().duration(DURATION).attr("width", 0).remove();

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
      .duration(DURATION)
      .attr("y", (d) => y(d.name) || 0)
      .attr("width", (d) => x(d.points))
      .attr("height", y.bandwidth());

    // Update labels
    const labels = chart
      .selectAll(".label")
      .data(sortedData, (d: any) => d.name);

    // Remove labels that no longer exist
    labels.exit().transition().duration(DURATION).style("opacity", 0).remove();

    // Add new labels
    const enterLabels = labels
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.points) + 5)
      .attr("y", (d) => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("opacity", 0)
      .text((d) => d3.format(",.0f")(51 - d.points));

    // Update all labels (existing + new)
    enterLabels
      .merge(labels as any)
      .transition()
      .duration(DURATION)
      .attr("x", (d) => x(d.points) + 5)
      .attr("y", (d) => (y(d.name) || 0) + y.bandwidth() / 2)
      .style("opacity", 1)
      .textTween(function (d) {
        const i = d3.interpolate(this._previousValue || 0, 51 - d.points);
        this._previousValue = 51 - d.points;
        return (t) => "#" + d3.format(",.0f")(i(t));
      });
  }, [processedData, currentDateIndex]);

  // Set up animation interval
  React.useEffect(() => {
    if (!isPlaying || processedData.dates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentDateIndex((prev) => (prev + 1) % processedData.dates.length);
    }, DURATION);

    return () => clearInterval(interval);
  }, [isPlaying, processedData.dates.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`${styles.container} bg-card fill-card-foreground w-fit`}>
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
