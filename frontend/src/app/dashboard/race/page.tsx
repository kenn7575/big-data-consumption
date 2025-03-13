"use client";

import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { client } from "@/axios";
import { countryCodes } from "@/lib/CountryCodeMapper";
import { cn } from "@/lib/utils";

import * as d3 from "d3";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface DataItem {
  date: string;
  name: string;
  points: number;
}

// Get countries that are likely to have music chart data
const POPULAR_COUNTRIES = [
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "IT",
  "ES",
  "JP",
  "SE",
  "NL",
  "NO",
  "DK",
  "FI",
  "NZ",
  "BR",
  "MX",
  "KR",
];

// Filter and format country options for the combobox
const countryOptions = Object.entries(countryCodes)
  .map(([code, name]) => ({
    value: code,
    label: name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const DURATION = 1500;
const BarChartRace: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<any>(null);
  // Add a key to trigger re-initialization
  const [chartKey, setChartKey] = useState(0);
  const [allData, setAllData] = useState<DataItem[]>([]); // Store all fetched data
  const [filteredData, setFilteredData] = useState<DataItem[]>([]); // Data after filtering
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused until data is loaded
  const [isLoading, setIsLoading] = useState(false);
  const [openCountrySelect, setOpenCountrySelect] = useState(false);

  // Date range tracking
  const [startDate, setStartDate] = useState("2023-11-01");
  const [endDate, setEndDate] = useState("2023-12-01");
  const [selectedCountry, setSelectedCountry] = useState("DK");
  const [fetchedDateRange, setFetchedDateRange] = useState<{
    start?: string;
    end?: string;
  }>({});

  // Group and process the data
  const processedData = React.useMemo(() => {
    // Group data by date
    const groupedByDate = d3.group(filteredData, (d) => d.date);
    // Get sorted unique dates
    const dates = Array.from(groupedByDate.keys()).sort();

    return { groupedByDate, dates };
  }, [filteredData]);

  const fetchData = async (
    start?: string,
    end?: string,
    countryCode: string = selectedCountry,
  ) => {
    // Reset data when country changes
    if (countryCode !== selectedCountry) {
      setAllData([]);
      setFilteredData([]);
    }

    // Check if we already have the data in the required range for the current country
    if (allData.length > 0 && countryCode === selectedCountry) {
      const existingDates = [...new Set(allData.map((d) => d.date))].sort();

      if (existingDates.length > 0) {
        const earliestDate = existingDates[0];
        const latestDate = existingDates[existingDates.length - 1];

        // If the new range is within what we already have, just filter the existing data
        const newStartInRange = !start || start >= earliestDate;
        const newEndInRange = !end || end <= latestDate;

        if (newStartInRange && newEndInRange) {
          console.log("Using cached data - filtering client-side");
          filterData(start, end);
          return;
        }
      }
    }

    // Otherwise fetch new data from API
    setIsLoading(true);
    try {
      let url = `Records/GetRecordBasedOnCountryAndDateAndCalculateSongsPoints/${countryCode.toLowerCase()}`;

      // Add query parameters if dates are provided
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log(`Fetching data for ${countryCode} from ${url}`);
      const response = await client.get<DataItem[]>(url);

      // Store the full dataset and the current filtered view
      setAllData(response.data);
      setFilteredData(response.data);
      setSelectedCountry(countryCode);

      // Store the date range we've fetched
      setFetchedDateRange({ start, end });

      // Reset animation index when new data is fetched
      setCurrentDateIndex(0);

      // Force chart reinitialization when data changes
      setChartKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = (start?: string, end?: string) => {
    if (!start && !end) {
      setFilteredData(allData);
      return;
    }

    let filtered = [...allData];

    if (start) {
      filtered = filtered.filter((item) => item.date >= start);
    }

    if (end) {
      filtered = filtered.filter((item) => item.date <= end);
    }

    setFilteredData(filtered);
    setCurrentDateIndex(0); // Reset to first date in the filtered range
  };

  // Initialize the chart - triggered by chartKey changes
  useEffect(() => {
    if (!svgRef.current || filteredData.length === 0) return;

    // Clear previous chart completely
    if (chartRef.current) {
      chartRef.current = null;
    }

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
      x,
      y,
      xAxis,
      yAxis,
      color,
      width,
      height,
    };

    console.log("Chart initialized with new data");
  }, [chartKey, filteredData.length]);

  // Update chart when date changes
  useEffect(() => {
    if (!chartRef.current || processedData.dates.length === 0) return;

    const currentDate = processedData.dates[currentDateIndex];
    if (!currentDate) return;

    const currentData = processedData.groupedByDate.get(currentDate) || [];

    const { chart, x, y, xAxis, yAxis, color, width } = chartRef.current;

    // Sort data by value in descending order
    const sortedData = [...currentData]
      .sort((a, b) => b.points - a.points)
      .slice(0, 15);

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
      .attr("y", (d: { name: string }) => y(d.name) || 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", (d: { name: string }) => color(d.name) as string);

    // Update all bars (existing + new)
    enterBars
      .merge(bars as any)
      .transition()
      .duration(DURATION)
      .attr("y", (d: { name: string }) => y(d.name) || 0)
      .attr("width", (d: { points: number }) => x(d.points))
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
      .attr("x", (d: { points: number }) => x(d.points) + 5)
      .attr("y", (d: { name: string }) => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("opacity", 0)
      .text((d: { points: number }) => d3.format(",.0f")(51 - d.points));

    // Update all labels (existing + new)
    enterLabels
      .merge(labels as any)
      .transition()
      .duration(DURATION)
      .attr("x", (d: { points: number }) => x(d.points) + 5)
      .attr("y", (d: { name: string }) => (y(d.name) || 0) + y.bandwidth() / 2)
      .style("opacity", 1)
      .textTween(function (
        this: { _previousValue?: number },
        d: { points: number },
      ) {
        const i = d3.interpolate(this._previousValue || 0, 51 - d.points);
        this._previousValue = 51 - d.points;
        return (t: number) => "#" + d3.format(",.0f")(i(t));
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

  const goToNext = () => {
    setIsPlaying(false);
    setCurrentDateIndex((prev) =>
      prev + 1 >= processedData.dates.length ? 0 : prev + 1,
    );
  };

  const goToPrevious = () => {
    setIsPlaying(false);
    setCurrentDateIndex((prev) =>
      prev - 1 < 0 ? processedData.dates.length - 1 : prev - 1,
    );
  };

  const handleRefetch = () => {
    fetchData(startDate, endDate);
  };

  const handleCountrySelect = (country: string) => {
    fetchData(startDate, endDate, country);
    setOpenCountrySelect(false);
  };

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">Music Chart Rankings</h1>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <Popover open={openCountrySelect} onOpenChange={setOpenCountrySelect}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCountrySelect}
                className="w-[200px] justify-between"
              >
                {selectedCountry
                  ? countryCodes[selectedCountry] || selectedCountry
                  : "Select country"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countryOptions.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.label} // Use label (country name) for search
                        onSelect={() => handleCountrySelect(country.value)} // Pass country code to handler
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCountry === country.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {country.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
            defaultValue={"2023-11-01"}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>

        <Button onClick={handleRefetch} className="mt-6" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : filteredData.length > 0 ? (
            "Update Range"
          ) : (
            "Load Data"
          )}
        </Button>
      </div>

      <div
        className={`bg-card fill-card-foreground flex w-fit flex-col items-center rounded-lg p-8`}
      >
        {isLoading ? (
          <div className="flex h-[500px] w-[800px] flex-col items-center justify-center">
            <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
            <p className="text-lg font-medium">Loading chart data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-[500px] w-[800px] flex-col items-center justify-center">
            <p className="text-lg font-medium">
              Select a date range and click "Load Data" to begin
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={goToPrevious} disabled={isPlaying}>
                <ArrowLeft />
              </Button>
              <Button onClick={togglePlay}>
                {isPlaying ? "Auto" : "Manual"}
              </Button>
              <Button onClick={goToNext} disabled={isPlaying}>
                <ArrowRight />
              </Button>
            </div>
            <span className="mt-4 text-2xl font-bold">
              {processedData.dates[currentDateIndex] || ""}
            </span>
            <svg key={chartKey} ref={svgRef} width="800" height="500"></svg>
          </>
        )}
      </div>
    </main>
  );
};

export default BarChartRace;
