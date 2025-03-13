import React, { useEffect, useRef } from "react";

import { getCountryName } from "@/lib/CountryCodeMapper";

import * as d3 from "d3";
import { feature } from "topojson-client";

interface WorldMapProps {
  artistData: { country: string; popularity: number }[];
}

const WorldMap: React.FC<WorldMapProps> = ({ artistData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 960;
    const height = 500;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Remove any existing tooltip
    if (tooltipRef.current) {
      tooltipRef.current.remove();
    }

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    const projection = d3
      .geoMercator()
      .scale(100)
      .center([0, 20])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Find the min and max values in the data for dynamic scaling
    let minPopularity = 0;
    let maxPopularity = 100;

    if (artistData && artistData.length > 0) {
      const popularityValues = artistData
        .map((d) => d.popularity)
        .filter((v) => v !== undefined && v !== null);
      if (popularityValues.length > 0) {
        minPopularity = Math.floor(d3.min(popularityValues) || 0);
        maxPopularity = Math.ceil(d3.max(popularityValues) || 100);

        // If min and max are the same, create a small range
        if (minPopularity === maxPopularity) {
          minPopularity = Math.max(0, minPopularity - 10);
          maxPopularity = minPopularity + 20;
        }
      }
    }

    // Use the dynamic range for the color scale
    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([minPopularity, maxPopularity]);

    // Create a tooltip div and store its reference
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("background-color", "white")
      .style("color", "black")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("z-index", "1000");

    tooltipRef.current = tooltip.node();

    // Load world map data
    d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(
      (topology: any) => {
        const countries = feature(topology, topology.objects.countries);

        svg
          .selectAll("path")
          .data((countries as any).features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const countryData = artistData.find(
              (data) =>
                getCountryName(data.country) === (d.properties as any).name,
            );
            return countryData ? colorScale(countryData.popularity) : "#eee";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mousemove", (event, d: any) => {
            const countryData = artistData.find(
              (data) => getCountryName(data.country) === d.properties.name,
            );

            // Get viewport-relative coordinates
            const tooltipX = event.clientX + 10;
            const tooltipY = event.clientY - 28;

            // Ensure tooltip stays within viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const tooltipWidth = 200;
            const tooltipHeight = 60;

            const finalX = Math.min(
              tooltipX,
              viewportWidth - tooltipWidth - 10,
            );
            const finalY = Math.min(
              tooltipY,
              viewportHeight - tooltipHeight - 10,
            );

            tooltip
              .style("opacity", 1)
              .html(
                `
              <strong>${d.properties.name}</strong><br/>
              Popularity: ${countryData ? countryData.popularity : "No data"}
            `,
              )
              .style("left", `${finalX}px`)
              .style("top", `${finalY}px`);
          })
          .on("mouseleave", () => {
            tooltip.style("opacity", 0);
          });

        // Add a legend with dynamic range
        const legendWidth = 200;
        const legendHeight = 10;

        const legendScale = d3
          .scaleLinear()
          .domain([minPopularity, maxPopularity])
          .range([0, legendWidth]);

        // Create ticks for the legend based on the data range
        const legendTicks = [];
        const tickCount = 5;
        const step = (maxPopularity - minPopularity) / (tickCount - 1);

        for (let i = 0; i < tickCount; i++) {
          legendTicks.push(Math.round(minPopularity + i * step));
        }

        const legendAxis = d3
          .axisBottom(legendScale)
          .tickValues(legendTicks)
          .tickFormat((d) => `${d}`);

        const legend = svg
          .append("g")
          .attr("transform", `translate(${20}, ${height - 40})`);

        const defs = svg.append("defs");
        const linearGradient = defs
          .append("linearGradient")
          .attr("id", "popularity-gradient");

        // Create gradient stops based on the min and max values
        linearGradient
          .selectAll("stop")
          .data(d3.range(0, 1.1, 0.1))
          .enter()
          .append("stop")
          .attr("offset", (d) => `${d * 100}%`)
          .attr("stop-color", (d) =>
            colorScale(minPopularity + d * (maxPopularity - minPopularity)),
          );

        legend
          .append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#popularity-gradient)");

        legend
          .append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis);

        legend
          .append("text")
          .attr("x", 0)
          .attr("y", -5)
          .style("font-size", "12px")
          .text(`Artist Popularity (${minPopularity}-${maxPopularity})`);
      },
    );

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [artistData]);

  return <svg ref={svgRef} className="h-full w-full" />;
};

export default WorldMap;
