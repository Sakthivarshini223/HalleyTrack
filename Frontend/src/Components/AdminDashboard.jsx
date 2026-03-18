import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Table,
  Settings2,
  Activity,
  CreditCard,
  Loader2,
  Calendar,
  LogOut,
} from "lucide-react";
import ChartRenderer from "./ChartRenderer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState([]);
  const [dateFilter, setDateFilter] = useState("All time");
  const [reportData, setReportData] = useState({
    raw: [],
    summary: { totalRevenue: 0, orderCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const getValueFromRow = (row, colName) => {
    if (!row) return "—";
    const mapping = {
      "Customer name": row.first_name
        ? `${row.first_name} ${row.last_name || ""}`.trim()
        : row.customer_name || "Guest",
      "Total amount": row.total_amount ?? row["Total amount"] ?? 0,
      "Order date": row.order_date ?? row["Order date"] ?? row.createdAt ?? "—",
      Product: row.product ?? "HallyTrack Unit",
      Status: row.status ?? "Pending",
      "Customer ID": row.id ?? row.user_id ?? "—",
      "Email id": row.email ?? row.email_id ?? "N/A",
    };
    const value =
      mapping[colName] !== undefined ? mapping[colName] : row[colName] ?? "—";
    if (
      colName.toLowerCase().includes("amount") ||
      colName.toLowerCase().includes("price")
    ) {
      return `$${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`;
    }
    return value;
  };

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const saved = localStorage.getItem("dashboard_config");
        let currentFilter = "All time";
        let localWidgets = [];
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            localWidgets = Array.isArray(parsed)
              ? parsed
              : parsed.widgets || [];
            currentFilter = parsed.dateFilter || "All time";
          } catch (e) {}
        }
        setWidgets(localWidgets);
        setDateFilter(currentFilter);

        const token = localStorage.getItem("halley_token");
        const response = await axios.get(
          `http://localhost:5000/api/dashboard-data`,
          {
            params: { filter: currentFilter },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const liveDbRows = Array.isArray(response.data) ? response.data : [];
        setReportData({
          raw: liveDbRows,
          summary: {
            totalRevenue: liveDbRows.reduce(
              (acc, curr) => acc + Number(curr.total_amount || 0),
              0
            ),
            orderCount: liveDbRows.length,
          },
        });
        setTimeout(() => setIsReady(true), 300);
      } catch (error) {
        console.error("Dashboard sync error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("halley_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const renderVisual = (widget) => {
    const dataToDisplay = reportData.raw || [];
    if (widget.type === "KPI") {
      return (
        <div className="w-full text-left">
          <div className="text-2xl font-black text-white tracking-tighter italic uppercase">
            {((w) => {
              if (!reportData?.raw?.length) return "0";
              const metric =
                w.metric === "Total amount" ? "total_amount" : w.metric || "id";
              if (w.aggregation === "Sum") {
                const sum = reportData.raw.reduce(
                  (acc, curr) => acc + (Number(curr[metric]) || 0),
                  0
                );
                return w.dataFormat === "Currency"
                  ? `$${sum.toLocaleString()}`
                  : sum.toLocaleString();
              }
              return reportData.raw.length.toLocaleString();
            })(widget)}
          </div>
          <p className="text-[8px] text-zinc-500 font-black uppercase mt-1 tracking-widest">
            Live Stream • {dateFilter}
          </p>
        </div>
      );
    }
    if (widget.type === "Table") {
      const columns = Array.isArray(widget.selectedColumns)
        ? widget.selectedColumns
        : ["Customer name", "Product", "Total amount"];
      return (
        <div className="w-full mt-4 rounded-xl border border-white/5 overflow-hidden bg-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-2 text-[7px] font-black text-black uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.length > 0 ? (
                dataToDisplay.slice(0, 10).map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-0 hover:bg-zinc-900 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="p-2 text-zinc-500 text-[9px] font-bold uppercase"
                      >
                        {getValueFromRow(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-6 text-center text-zinc-800 text-[8px] font-black uppercase"
                  >
                    Null Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="w-full mt-4 h-[200px]">
        {isReady && dataToDisplay.length > 0 ? (
          <ChartRenderer widget={widget} data={dataToDisplay} />
        ) : (
          <div className="h-full border border-dashed border-white/5 rounded-xl flex items-center justify-center text-[8px] text-zinc-800 font-black uppercase">
            Syncing...
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-2">
        <Loader2 className="text-orange-600 animate-spin" size={24} />
        <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">
          HallyTrack Link
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-orange-600/30">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            HALLYTRACK{" "}
            <span className="text-orange-600 not-italic">INTELLIGENCE</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">
              SYSTEM UPLINK: ACTIVE
            </p>
            <div className="w-1 h-1 rounded-full bg-orange-600 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto items-end">
          <button
            onClick={handleLogout}
            className="w-full md:w-64 flex items-center justify-between px-5 py-3 bg-red-600/10 border border-red-900/30 rounded-xl group hover:bg-red-600 hover:border-red-600 transition-all shadow-lg shadow-red-900/10"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 group-hover:text-white transition-colors">
              Terminate Session
            </span>
            <LogOut
              size={14}
              className="text-red-500 group-hover:text-white transition-colors"
              strokeWidth={3}
            />
          </button>

          <button
            onClick={() => navigate("/configure-dashboard")}
            className="w-full md:w-64 flex items-center justify-between px-5 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase hover:border-orange-600 transition-all group opacity-70 hover:opacity-100"
          >
            <span className="text-zinc-500 group-hover:text-orange-600 transition-colors tracking-widest">
              System Config
            </span>
            <Settings2
              size={12}
              className="text-zinc-500 group-hover:text-orange-600 transition-colors"
            />
          </button>
        </div>
      </header>

      <nav className="flex items-center gap-1 mb-12 bg-[#0a0a0a] p-1.5 rounded-2xl w-fit border border-white/5 shadow-2xl">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase bg-orange-600 text-white transition-all">
          <LayoutDashboard size={16} strokeWidth={2.5} /> DASHBOARD
        </button>
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all"
        >
          <Table size={16} strokeWidth={2.5} /> REPORTS
        </button>
        <button
          onClick={() => navigate("/create-card")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all"
        >
          <CreditCard size={16} strokeWidth={2.5} /> CARD
        </button>
      </nav>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {widgets.length > 0 ? (
          widgets.map((widget) => (
            <div
              key={widget.id}
              className={`p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/10 backdrop-blur-md transition-all hover:border-orange-600/20 ${
                widget.type === "KPI"
                  ? "col-span-1"
                  : "col-span-1 sm:col-span-2"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">
                  {widget.title}
                </span>
                <div className="p-2 rounded-lg bg-orange-600/5">
                  <Activity size={12} className="text-orange-600" />
                </div>
              </div>
              {renderVisual(widget)}
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center border border-dashed border-white/10 rounded-[3rem] bg-zinc-900/5">
            <p className="text-zinc-800 uppercase text-[9px] font-black tracking-[0.5em] mb-4">
              GRID OFFLINE / NO MODULES DETECTED
            </p>
            <button
              onClick={() => navigate("/configure-dashboard")}
              className="text-orange-600 text-[9px] font-black uppercase border-b-2 border-orange-600/20 pb-1 hover:border-orange-600 transition-all"
            >
              INITIALIZE SYSTEM CONFIG
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
