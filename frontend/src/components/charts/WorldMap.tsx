import React, { useEffect, useRef } from "react";

import { getCountryName } from "@/lib/CountryCodeMapper";

import * as d3 from "d3";
import { Feature, Geometry } from "geojson";
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

    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([0, 100]); // Popularity ranges from 0 to 100

    // Create a tooltip div and store its reference
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "fixed") // Changed from absolute to fixed
      .style("pointer-events", "none") // Make tooltip ignore mouse events
      .style("background-color", "white")
      .style("color", "black")
      .style("padding", "10px")
      .style("border-radius", "5px")
      //   .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)")
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
            const tooltipWidth = 200; // Approximate width
            const tooltipHeight = 60; // Approximate height

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

        // Add a legend
        const legendWidth = 200;
        const legendHeight = 10;

        const legendScale = d3
          .scaleLinear()
          .domain([0, 100])
          .range([0, legendWidth]);

        const legendAxis = d3
          .axisBottom(legendScale)
          .ticks(5)
          .tickFormat((d) => `${d}%`);

        const legend = svg
          .append("g")
          .attr("transform", `translate(${20}, ${0})`);

        const defs = svg.append("defs");
        const linearGradient = defs
          .append("linearGradient")
          .attr("id", "popularity-gradient");

        linearGradient
          .selectAll("stop")
          .data(d3.range(0, 1.1, 0.1))
          .enter()
          .append("stop")
          .attr("offset", (d) => `${d * 100}%`)
          .attr("stop-color", (d) => colorScale(d * 100));

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
          .text("Artist Popularity");
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
