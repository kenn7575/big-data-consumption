"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import * as d3 from "d3";

import styles from "../race/race.module.css";

interface DataItem {
  date: string;
  name: string;
  value: number;
}

const BarChartRace: React.FC = () => {
  // Keep existing state variables
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<any>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1500);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // Refs for data management
  const dataBufferRef = useRef<{ [date: string]: DataItem[] }>({});
  const processedDatesRef = useRef<Set<string>>(new Set());
  const isStreamingRef = useRef<boolean>(false);
  const waitingForDataRef = useRef<boolean>(false);

  // Add log function for debugging
  const addLog = useCallback((message: string) => {
    setDebugLog((prev) => [message, ...prev.slice(0, 9)]);
    console.log(message);
  }, []);

  // Group and process the data
  const processedData = React.useMemo(() => {
    const groupedByDate = d3.group(data, (d) => d.date);
    const dates = Array.from(groupedByDate.keys()).sort();
    return { groupedByDate, dates };
  }, [data]);

  // Process incoming data chunks
  const processChunk = useCallback(
    (jsonStr: string) => {
      try {
        // Improved error handling for JSON parsing
        let chunkData;
        try {
          chunkData = JSON.parse(jsonStr) as {
            date: string;
            items: DataItem[];
          };
        } catch (e) {
          addLog(
            `JSON parse error: ${e.message}, data: ${jsonStr.substring(0, 50)}...`,
          );
          return;
        }

        if (!chunkData.date || !Array.isArray(chunkData.items)) {
          addLog(`Invalid data format: missing date or items array`);
          return;
        }

        // Skip if we've already processed this date
        if (processedDatesRef.current.has(chunkData.date)) {
          addLog(`Skipping duplicate date: ${chunkData.date}`);
          return;
        }

        // Add to our buffer
        dataBufferRef.current[chunkData.date] = chunkData.items;
        processedDatesRef.current.add(chunkData.date);
        addLog(
          `Added data for date: ${chunkData.date}, items: ${chunkData.items.length}`,
        );

        // If we were waiting for data, consume it now
        if (waitingForDataRef.current) {
          consumeNextDataChunk();
          waitingForDataRef.current = false;
        }

        // If this is our first data, start the animation
        if (Object.keys(dataBufferRef.current).length === 1 && !isPlaying) {
          addLog("First data chunk received, starting animation");
          consumeNextDataChunk();
          setIsPlaying(true);
        }
      } catch (e) {
        addLog(`Error processing chunk: ${e.message}`);
      }
    },
    [isPlaying, addLog],
  );

  // Consume the next chunk from the buffer
  const consumeNextDataChunk = useCallback(() => {
    // Get all available dates in our buffer, sorted
    const availableDates = Object.keys(dataBufferRef.current).sort();

    if (availableDates.length === 0) {
      addLog("No data available in buffer, waiting for more");
      waitingForDataRef.current = true;
      return;
    }

    // Get next date's data
    const nextDate = availableDates[0];
    const nextData = dataBufferRef.current[nextDate];
    addLog(`Consuming data for date: ${nextDate}, items: ${nextData.length}`);

    // Update our main data state with this chunk
    setData((prevData) => {
      // Keep a reasonable amount of historical data
      const newData = [
        ...prevData.filter((d) => d.date !== nextDate),
        ...nextData,
      ];

      // Limit history to last 3 dates to prevent memory issues
      const dates = Array.from(new Set(newData.map((d) => d.date))).sort();
      if (dates.length > 3) {
        const dateToRemove = dates[0];
        return newData.filter((d) => d.date !== dateToRemove);
      }
      return newData;
    });

    // Remove this date from our buffer
    delete dataBufferRef.current[nextDate];

    // Force current date index to 0 to show the new data
    setCurrentDateIndex(0);
  }, [addLog]);

  // Function to start streaming data from API
  const startStreaming = useCallback(async () => {
    if (isStreamingRef.current) {
      addLog("Already streaming data");
      return;
    }

    isStreamingRef.current = true;
    setIsLoading(true);
    addLog("Starting data stream");

    try {
      const response = await fetch("http://localhost:5050/stream");

      if (!response.body) {
        throw new Error("ReadableStream not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          addLog("Stream complete");
          if (buffer) {
            try {
              processChunk(buffer);
            } catch (e) {
              addLog(`Error processing final chunk: ${e.message}`);
            }
          }
          break;
        }

        if (!value) {
          addLog("Received undefined value from stream");
          continue;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        addLog(`Received chunk, size: ${chunk.length} bytes`);

        // Process complete JSON objects - look for newlines
        let endIndex;
        while ((endIndex = buffer.indexOf("}\n")) !== -1) {
          const jsonStr = buffer.substring(0, endIndex + 1);
          buffer = buffer.substring(endIndex + 2);

          addLog(`Processing JSON object, length: ${jsonStr.length}`);
          processChunk(jsonStr);
        }
      }
    } catch (error) {
      addLog(`Error streaming data: ${error.message}`);
    } finally {
      isStreamingRef.current = false;
      setIsLoading(false);
    }
  }, [addLog, processChunk]);

  // Sample data for testing
  useEffect(() => {
    const sampleData: DataItem[] = [
      { date: "2000-01-01", name: "Blinding Lights", value: 72537 },
      { date: "2000-01-01", name: "Shape of You", value: 65421 },
      { date: "2000-01-01", name: "Dance Monkey", value: 59087 },
      { date: "2000-01-01", name: "Someone You Loved", value: 53942 },
      { date: "2000-01-01", name: "One Dance", value: 47826 },
    ];

    setData(sampleData);
    addLog("Initialized with sample data");
  }, [addLog]);

  // Set up animation interval and data consumption - keep existing implementation
  useEffect(() => {
    if (!isPlaying || processedData.dates.length === 0) return;

    addLog(
      `Animation playing: currentDateIndex=${currentDateIndex}, speed=${animationSpeed}ms`,
    );
    const interval = setInterval(() => {
      const nextIndex = (currentDateIndex + 1) % processedData.dates.length;

      // If we've reached the end of our current data, try to get more
      if (nextIndex === 0) {
        addLog("Reached end of current data");
        // Check if we have more data in buffer
        if (Object.keys(dataBufferRef.current).length > 0) {
          addLog("Consuming next data chunk from buffer");
          // Consume the next chunk
          consumeNextDataChunk();
        } else if (isStreamingRef.current) {
          // Still streaming but no data ready yet, we'll wait for more data
          addLog("No more data in buffer, waiting for stream");
          waitingForDataRef.current = true;
        }
      }

      setCurrentDateIndex(nextIndex);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    processedData.dates.length,
    currentDateIndex,
    animationSpeed,
    consumeNextDataChunk,
    addLog,
  ]);

  // Toggle play/pause state
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
    addLog(`Animation ${!isPlaying ? "started" : "paused"}`);
  }, [isPlaying, addLog]);

  // Speed adjustment function
  const changeSpeed = useCallback(
    (faster: boolean) => {
      setAnimationSpeed((prev) =>
        faster ? Math.max(500, prev - 250) : Math.min(3000, prev + 250),
      );
      addLog(
        `Animation speed ${faster ? "increased" : "decreased"} to ${
          faster
            ? Math.max(500, animationSpeed - 250)
            : Math.min(3000, animationSpeed + 250)
        }ms`,
      );
    },
    [animationSpeed, addLog],
  );

  // Initialize the chart once
  useEffect(() => {
    if (!svgRef.current || data.length === 0) {
      addLog("SVG ref or data not ready, skipping chart initialization");
      return;
    }

    addLog("Initializing chart");
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

    addLog("Chart initialized successfully");
  }, [data.length > 0, addLog]);

  // Update chart when date changes
  useEffect(() => {
    if (!chartRef.current || processedData.dates.length === 0) {
      addLog("Chart ref or processed data not ready, skipping update");
      return;
    }

    const currentDate = processedData.dates[currentDateIndex];
    const currentData = processedData.groupedByDate.get(currentDate) || [];

    const { chart, dateText, x, y, xAxis, yAxis, color, width } =
      chartRef.current;

    addLog(
      `Updating chart for date: ${currentDate} with ${currentData.length} items`,
    );

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

    addLog(`Chart updated successfully for ${currentDate}`);
  }, [processedData, currentDateIndex, addLog]);

  return (
    <div className={styles.container}>
      <h1>Music Chart Rankings</h1>
      <div className={styles.controls}>
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <button
          onClick={() => startStreaming()}
          disabled={isStreamingRef.current}
        >
          {isLoading ? "Loading..." : "Start Streaming"}
        </button>
        <button onClick={() => changeSpeed(true)}>Speed Up</button>
        <button onClick={() => changeSpeed(false)}>Slow Down</button>
        <span className={styles.speedDisplay}>Speed: {animationSpeed}ms</span>
        <span className={styles.dateDisplay}>
          {processedData.dates[currentDateIndex] || ""}
        </span>
        {waitingForDataRef.current && (
          <span className={styles.loading}>Waiting for data...</span>
        )}
      </div>
      <svg ref={svgRef} width="800" height="500"></svg>

      {/* Debug display */}
      <div className={styles.debugPanel}>
        <h3>Debug Log</h3>
        <div className={styles.logContainer}>
          {debugLog.map((log, i) => (
            <div key={i} className={styles.logEntry}>
              {log}
            </div>
          ))}
        </div>
        <div>
          <strong>Buffer Dates:</strong>{" "}
          {Object.keys(dataBufferRef.current).join(", ")}
        </div>
        <div>
          <strong>Current Data Dates:</strong> {processedData.dates.join(", ")}
        </div>
      </div>
    </div>
  );
};

export default BarChartRace;
