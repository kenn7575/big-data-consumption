"use client";

import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  CartesianGrid,
  Label,
  Line,
  LineChart as LineChartMain,
  XAxis,
  YAxis,
} from "recharts";

interface LineChartProps<T extends object> {
  title: ReactNode;
  description?: ReactNode;
  titleLeft: [ReactNode, ReactNode];
  headerRight?: ReactNode;
  data: T[];
  XKey: keyof T & string;
  YKey: keyof T & string;
  Footer?: [ReactNode, ReactNode];
}

export function LineChart<T extends object>({
  title,
  description,
  titleLeft,
  headerRight,
  data,
  XKey,
  YKey,
  Footer,
}: LineChartProps<T>) {
  const chartConfig = {} as ChartConfig;

  for (const item of data) {
    for (const key of Object.keys(item)) {
      if (key === XKey || key === YKey) continue;

      if (!chartConfig[key]) {
        const chartConfigLength = Object.keys(chartConfig).length;

        chartConfig[key] = { color: `var(--chart-${chartConfigLength + 1})` };
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-20">
        <div>
          <CardTitle className="text-sm">{titleLeft[0]}</CardTitle>
          <CardDescription className="text-xs">{titleLeft[1]}</CardDescription>
        </div>

        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        {headerRight}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChartMain
            accessibilityLayer
            data={data}
            margin={{ top: 10, right: 20, bottom: 60, left: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={XKey}
              tickLine={false}
              axisLine={false}
              angle={90}
              height={50}
              dy={50}
            />
            <YAxis
              dataKey={YKey}
              max={50}
              min={1}
              domain={[1, 50]}
              ticks={[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
              tickMargin={5}
              reversed
            >
              <Label
                value={YKey}
                angle={-90}
                position="insideLeft"
                offset={10}
              />
            </YAxis>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  itemSorter={(item) => item.value as number}
                />
              }
            />
            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="linear"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChartMain>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm" hidden>
        <div className="flex gap-2 leading-none font-medium">{Footer?.[0]}</div>
        <div className="text-muted-foreground leading-none">{Footer?.[1]}</div>
      </CardFooter>
    </Card>
  );
}
