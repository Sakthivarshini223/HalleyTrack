import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  Table as TableIcon,
  Activity,
  Trash2,
  Plus,
  X,
  Save,
  Edit3,
  Calendar,
  AlertTriangle,
  Check,
} from "lucide-react";


const InputGroup = ({ label, children, mandatory = false }) => (
  <div className="mb-4 text-left">
    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
      {label} {mandatory && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const ConfigureDashboard = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState("Charts");

  
  const [dashboardData, setDashboardData] = useState(() => {
    const saved = localStorage.getItem("dashboard_config");
    if (!saved) return { dateFilter: "All time", widgets: [] };
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? { dateFilter: "All time", widgets: parsed }
      : parsed;
  });

  const placedWidgets = dashboardData.widgets;
  const dateFilter = dashboardData.dateFilter;

  const [draggingItem, setDraggingItem] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

 
  const numericMeasures = ["total_amount", "quantity", "unit_price"];
  const chartDimensions = [
    "product_name",
    "status",
    "first_name",
    "email",
    "createdAt",
  ];
  const tableColumns = [
    "id",
    "first_name",
    "last_name",
    "email",
    "product_name",
    "quantity",
    "unit_price",
    "total_amount",
    "status",
    "createdAt",
  ];

  
  const setGlobalDateFilter = (val) => {
    const updatedData = { ...dashboardData, dateFilter: val };
    setDashboardData(updatedData);
    localStorage.setItem("dashboard_config", JSON.stringify(updatedData));
  };

  
  const updateWidget = (id, field, value) => {
    const updatedWidgets = placedWidgets.map((w) =>
      w.id === id ? { ...w, [field]: value } : w
    );
    const updatedData = { ...dashboardData, widgets: updatedWidgets };
    setDashboardData(updatedData);

  
    setEditingWidget((prev) => ({ ...prev, [field]: value }));
  };

  
  const confirmDelete = () => {
    if (deleteConfirmId) {
      const updatedWidgets = placedWidgets.filter(
        (w) => w.id !== deleteConfirmId
      );
      const updatedData = { ...dashboardData, widgets: updatedWidgets };

      setDashboardData(updatedData);
      localStorage.setItem("dashboard_config", JSON.stringify(updatedData));

      if (editingWidget?.id === deleteConfirmId) setEditingWidget(null);
      setDeleteConfirmId(null);
    }
  };

  const addWidgetToGrid = (item, index) => {
    if (placedWidgets.find((w) => w.gridIndex === index)) return;

    
    const defaults = {
      id: Date.now(),
      gridIndex: index,
      title: `Untitled ${item.name}`,
      type: item.type,
      width: item.type === "KPI" ? 2 : 4,
      height: item.type === "KPI" ? 2 : 4,
      metric: "total_amount",
      aggregation: "Sum",
      dataFormat: "Currency",
      decimalPrecision: 2,
      xAxis: "product_name",
      yAxis: "total_amount",
      chartColor: "#f97316",
      selectedColumns: ["first_name", "product_name", "total_amount"],
      sortBy: "createdAt",
      pagination: "10",
      fontSize: 14,
      headerBg: "#54bd95",
    };

    const updatedData = {
      ...dashboardData,
      widgets: [...dashboardData.widgets, { ...item, ...defaults }],
    };
    setDashboardData(updatedData);
    localStorage.setItem("dashboard_config", JSON.stringify(updatedData));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans text-left">
     
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">
              Remove Widget?
            </h3>
            <p className="text-zinc-500 text-sm mb-8 font-medium">
              This will permanently remove the component from your dashboard
              layout.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-6 py-4 bg-zinc-800 rounded-2xl text-xs font-bold uppercase hover:bg-zinc-700 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-red-600 rounded-2xl text-xs font-bold uppercase hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-950 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-sm font-bold uppercase tracking-widest italic bg-gradient-to-r from-orange-500 to-white bg-clip-text text-transparent">
            Nexus Configurator
          </h1>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(
              "dashboard_config",
              JSON.stringify(dashboardData)
            );
            navigate("/admin-dashboard");
          }}
          className="px-6 py-2 bg-emerald-500 text-black text-[10px] font-black rounded-xl hover:bg-emerald-400 transition-transform active:scale-95"
        >
          PUBLISH DASHBOARD
        </button>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        <aside className="w-full md:w-72 border-r border-white/10 bg-zinc-950 p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-6 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-4 flex items-center gap-2">
              <Calendar size={12} className="text-orange-500" /> Active Period
            </p>
            <select
              value={dateFilter}
              onChange={(e) => setGlobalDateFilter(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 outline-none transition-all"
            >
              <option>All time</option>
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <p className="text-[10px] font-black uppercase text-orange-500 mb-4 px-1 tracking-widest">
            Components
          </p>
          {[
            {
              cat: "Charts",
              items: [
                { name: "Bar Chart", type: "Bar chart" },
                { name: "Line Chart", type: "Line chart" },
                { name: "Pie Chart", type: "Pie chart" },
                { name: "Area Chart", type: "Area chart" },
                { name: "Scatter Plot", type: "Scatter chart" },
              ],
            },
            { cat: "Tables", items: [{ name: "Table", type: "Table" }] },
            { cat: "KPIs", items: [{ name: "KPI Card", type: "KPI" }] },
          ].map((section) => (
            <div
              key={section.cat}
              className="mb-2 border border-white/5 rounded-xl bg-zinc-900/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenSection(section.cat)}
                className="w-full p-4 text-[10px] font-black flex justify-between uppercase tracking-tighter"
              >
                {section.cat}{" "}
                <ChevronDown
                  size={14}
                  className={
                    openSection === section.cat ? "rotate-180" : "text-zinc-600"
                  }
                />
              </button>
              {openSection === section.cat && (
                <div className="px-3 pb-3 space-y-2 text-left">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      draggable
                      onDragStart={() => setDraggingItem(item)}
                      className="p-3 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-between cursor-grab hover:border-orange-500/40 hover:bg-zinc-800 transition-all active:cursor-grabbing group"
                    >
                      <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white">
                        {item.name}
                      </span>
                      <Plus size={14} className="text-orange-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main className="flex-1 bg-zinc-950/50 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto text-left">
            {[...Array(12)].map((_, i) => {
              const widget = placedWidgets.find((w) => w.gridIndex === i);
              return (
                <div
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() =>
                    draggingItem && addWidgetToGrid(draggingItem, i)
                  }
                  className={`relative h-64 border border-white/5 bg-zinc-900/40 rounded-[2.5rem] flex flex-col group overflow-hidden transition-all shadow-inner
                    ${
                      !widget
                        ? "border-dashed border-white/10 hover:border-orange-500/20"
                        : "hover:border-white/20"
                    }`}
                >
                  {!widget ? (
                    <div className="flex flex-col items-center justify-center m-auto opacity-20 group-hover:opacity-60 transition-opacity">
                      <Plus className="mb-2 text-orange-500" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        Slot {i + 1}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="p-5 flex justify-between items-start z-10 relative">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white uppercase truncate pr-4">
                            {widget.title}
                          </span>
                          <span className="text-[8px] text-emerald-500 font-bold uppercase mt-0.5 tracking-widest flex items-center gap-1">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />{" "}
                            Live
                          </span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingWidget(widget)}
                            className="p-2 bg-zinc-800 rounded-xl text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(widget.id)}
                            className="p-2 bg-zinc-800 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 w-full pb-8 px-4 flex items-center justify-center overflow-hidden">
                        <Activity
                          size={48}
                          style={{ color: widget.chartColor || "#f97316" }}
                          className="opacity-10 animate-pulse"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </main>

     
        {editingWidget && (
          <aside className="fixed inset-y-0 right-0 w-full md:w-80 bg-zinc-900 border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 text-left">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-zinc-950">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-orange-500">
                  {editingWidget.type}
                </h2>
                <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">
                  Configuration Node
                </p>
              </div>
              <button
                onClick={() => setEditingWidget(null)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <InputGroup label="Display Label" mandatory>
                <input
                  type="text"
                  value={editingWidget.title}
                  onChange={(e) =>
                    updateWidget(editingWidget.id, "title", e.target.value)
                  }
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none transition-all"
                />
              </InputGroup>

              <section className="bg-black/40 p-5 rounded-[2rem] border border-white/5">
                <p className="text-[9px] font-black text-zinc-600 uppercase mb-4 tracking-widest">
                  Dimensions
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Cols">
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={editingWidget.width}
                      onChange={(e) =>
                        updateWidget(
                          editingWidget.id,
                          "width",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </InputGroup>
                  <InputGroup label="Rows">
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={editingWidget.height}
                      onChange={(e) =>
                        updateWidget(
                          editingWidget.id,
                          "height",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </InputGroup>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  Data Source
                </p>

                {editingWidget.type === "KPI" ? (
                  <>
                    <InputGroup label="Metric" mandatory>
                      <select
                        value={editingWidget.metric}
                        onChange={(e) =>
                          updateWidget(
                            editingWidget.id,
                            "metric",
                            e.target.value
                          )
                        }
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                      >
                        {numericMeasures.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                        <option value="id">Record ID (Count)</option>
                      </select>
                    </InputGroup>
                    <InputGroup label="Logic">
                      <select
                        value={editingWidget.aggregation}
                        onChange={(e) =>
                          updateWidget(
                            editingWidget.id,
                            "aggregation",
                            e.target.value
                          )
                        }
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                      >
                        <option>Sum</option>
                        <option>Average</option>
                        <option>Count</option>
                      </select>
                    </InputGroup>
                  </>
                ) : editingWidget.type === "Table" ? (
                  <>
                    <InputGroup label="Table Fields" mandatory>
                      <div className="w-full bg-black border border-white/10 rounded-xl p-3 h-48 overflow-y-auto custom-scrollbar space-y-2">
                        {tableColumns.map((col) => {
                          const isSelected =
                            editingWidget.selectedColumns.includes(col);
                          return (
                            <div
                              key={col}
                              onClick={() => {
                                const newCols = isSelected
                                  ? editingWidget.selectedColumns.filter(
                                      (c) => c !== col
                                    )
                                  : [...editingWidget.selectedColumns, col];
                                updateWidget(
                                  editingWidget.id,
                                  "selectedColumns",
                                  newCols
                                );
                              }}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                                isSelected
                                  ? "bg-orange-500/10 border-orange-500/50 text-orange-500"
                                  : "bg-zinc-900/50 border-transparent text-zinc-400 hover:bg-zinc-800"
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {col}
                              </span>
                              {isSelected ? (
                                <Check size={12} />
                              ) : (
                                <Plus size={12} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </InputGroup>
                    <InputGroup label="Rows Per Page">
                      <div className="flex gap-2">
                        {["5", "10", "15"].map((val) => (
                          <button
                            key={val}
                            onClick={() =>
                              updateWidget(editingWidget.id, "pagination", val)
                            }
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border ${
                              editingWidget.pagination === val
                                ? "bg-white text-black border-white"
                                : "bg-black text-zinc-500 border-white/10 hover:border-white/30"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </InputGroup>
                  </>
                ) : (
                  <>
                    <InputGroup label="X-Axis" mandatory>
                      <select
                        value={editingWidget.xAxis}
                        onChange={(e) =>
                          updateWidget(
                            editingWidget.id,
                            "xAxis",
                            e.target.value
                          )
                        }
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                      >
                        {chartDimensions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </InputGroup>
                    <InputGroup label="Y-Axis" mandatory>
                      <select
                        value={editingWidget.yAxis}
                        onChange={(e) =>
                          updateWidget(
                            editingWidget.id,
                            "yAxis",
                            e.target.value
                          )
                        }
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                      >
                        {numericMeasures.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </InputGroup>
                  </>
                )}
              </section>

              <section className="space-y-4">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  Visual Style
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Theme Color">
                    <input
                      type="color"
                      value={editingWidget.chartColor}
                      onChange={(e) =>
                        updateWidget(
                          editingWidget.id,
                          "chartColor",
                          e.target.value
                        )
                      }
                      className="w-full h-12 bg-black border border-white/10 rounded-xl cursor-pointer p-1"
                    />
                  </InputGroup>
                  <InputGroup label="Header Bg">
                    <input
                      type="color"
                      value={editingWidget.headerBg}
                      onChange={(e) =>
                        updateWidget(
                          editingWidget.id,
                          "headerBg",
                          e.target.value
                        )
                      }
                      className="w-full h-12 bg-black border border-white/10 rounded-xl cursor-pointer p-1"
                    />
                  </InputGroup>
                </div>
                <InputGroup label="Base Font Size">
                  <input
                    type="range"
                    min="12"
                    max="18"
                    value={editingWidget.fontSize}
                    onChange={(e) =>
                      updateWidget(
                        editingWidget.id,
                        "fontSize",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-bold mt-1">
                    <span>12px</span>
                    <span>{editingWidget.fontSize}px</span>
                    <span>18px</span>
                  </div>
                </InputGroup>
              </section>
            </div>

            <div className="p-6 bg-zinc-950 border-t border-white/10">
              <button
                onClick={() => {
                  localStorage.setItem(
                    "dashboard_config",
                    JSON.stringify(dashboardData)
                  );
                  setEditingWidget(null);
                }}
                className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 hover:scale-[1.02] transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-600/20"
              >
                <Save size={16} /> Sync Configuration
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default ConfigureDashboard;
