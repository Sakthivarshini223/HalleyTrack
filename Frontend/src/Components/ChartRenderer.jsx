import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

const ChartRenderer = ({ widget, data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[10px] text-zinc-600 uppercase font-bold">
        No Data for {widget.title}
      </div>
    );
  }

  const getMappedKey = (label) => {
    const map = {
      Product: "product_name",
      "Total amount": "total_amount",
      Quantity: "quantity",
    };
    return map[label] || label;
  };

  const xKey = getMappedKey(widget.xAxis || "Product");
  const yKey = getMappedKey(widget.yAxis || widget.metric || "Total amount");
  const accentColor = widget.chartColor || "#f97316";

  const processedData = React.useMemo(() => {
    const registry = {};
    data.forEach((item) => {
      const label = item[xKey] || "Unknown";
      const value = parseFloat(item[yKey]) || 0;
      registry[label] = (registry[label] || 0) + value;
    });
    return Object.keys(registry).map((key) => ({
      name: key,
      value: registry[key],
    }));
  }, [data, xKey, yKey]);

  const renderChart = () => {
    const type = (widget.type || "").toLowerCase();
    const tooltipStyle = {
      backgroundColor: "#09090b",
      border: "1px solid #27272a",
      fontSize: "10px",
    };

    if (type.includes("scatter")) {
      return (
        <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#18181b"
            vertical={false}
          />
          <XAxis
            type="category"
            dataKey="name"
            stroke="#3f3f46"
            fontSize={10}
            interval={0}
          />
          <YAxis type="number" dataKey="value" stroke="#3f3f46" fontSize={10} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={tooltipStyle}
          />
          <Scatter name="Data" data={processedData} fill={accentColor} />
        </ScatterChart>
      );
    }

    if (type.includes("area")) {
      return (
        <AreaChart
          data={processedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#18181b"
            vertical={false}
          />
          <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} />
          <YAxis stroke="#3f3f46" fontSize={10} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={accentColor}
            fill="url(#colorArea)"
          />
        </AreaChart>
      );
    }

    if (type.includes("pie")) {
      return (
        <PieChart>
          <Pie
            data={processedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
          >
            {processedData.map((entry, index) => (
              <Cell key={index} fill={accentColor} opacity={1 - index * 0.15} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      );
    }

    if (type.includes("line")) {
      return (
        <LineChart
          data={processedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#18181b"
            vertical={false}
          />
          <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} />
          <YAxis stroke="#3f3f46" fontSize={10} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={accentColor}
            strokeWidth={3}
          />
        </LineChart>
      );
    }

    return (
      <BarChart
        data={processedData}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#18181b"
          vertical={false}
        />
        <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} />
        <YAxis stroke="#3f3f46" fontSize={10} />
        <Tooltip
          cursor={{ fill: "#27272a", opacity: 0.4 }}
          contentStyle={tooltipStyle}
        />
        <Bar
          dataKey="value"
          fill={accentColor}
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    );
  };

  return (
    <div className="w-full h-[220px] relative">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;
