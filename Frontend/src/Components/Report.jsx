import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  X,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  LayoutDashboard,
  Table,
  CreditCard,
  Loader2,
  LogOut,
  Clock,
  Play,
  CheckCircle,
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    product: "HallyTrack Core Fiber",
    quantity: 1,
    unitPrice: "",
    totalAmount: 0,
    status: "Pending",
    createdBy: "Mr. Michael Harris",
  });

  const fetchFromDB = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("halley_token");
      const response = await axios.get("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedData = response.data.recentActivity.map((order, index) => {
        const displayName = order.first_name
          ? `${order.first_name} ${order.last_name || ""}`
          : order.User
          ? order.User.name
          : "Guest User";

        return {
          sNo: index + 1,
          dbId: order.id,
          custId: order.user_id ? `HT-${order.user_id}` : "MANUAL",
          customerName: displayName,
          email: order.User ? order.User.email : order.email || "N/A",
          orderId: `HT-ORD-${order.id}`,
          amount: order.total_amount,
          status: order.status,
          raw: order,
        };
      });
      setReports(formattedData);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchFromDB();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem("halley_token");
    try {
      await axios.patch(
        `http://localhost:5000/api/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReports((prev) =>
        prev.map((r) => (r.dbId === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Status Update Failed", err);
    }
  };

  useEffect(() => {
    const total =
      (Number(formData.quantity) || 0) * (Number(formData.unitPrice) || 0);
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.quantity, formData.unitPrice]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleEdit = (order) => {
    const d = order.raw;
    setEditingId(order.orderId);
    setFormData({
      firstName: d.first_name || "",
      lastName: d.last_name || "",
      email: d.email || "",
      phone: d.phone_number || "",
      address: d.street_address || "",
      city: d.city || "",
      state: d.state || "",
      postalCode: d.postal_code || "",
      country: d.country || "United States",
      product: d.product_name || "HallyTrack Core Fiber",
      quantity: Number(d.quantity) || 1,
      unitPrice: Number(d.total_amount) / (Number(d.quantity) || 1),
      totalAmount: Number(d.total_amount) || 0,
      status: d.status || "Pending",
      createdBy: d.created_by || "Mr. Michael Harris",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      product: "HallyTrack Core Fiber",
      quantity: 1,
      unitPrice: "",
      totalAmount: 0,
      status: "Pending",
      createdBy: "Mr. Michael Harris",
    });
    setEditingId(null);
  };

  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId.replace("HT-ORD-", ""));
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("halley_token");
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFromDB();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("halley_token");
    try {
      const dbId = editingId ? editingId.replace("HT-ORD-", "") : null;
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone,
        street_address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        total_amount: formData.totalAmount,
        product_name: formData.product,
        quantity: formData.quantity,
        status: formData.status,
        created_by: formData.createdBy,
      };

      const endpoint = editingId
        ? `http://localhost:5000/api/orders/${dbId}`
        : "http://localhost:5000/api/orders";
      const method = editingId ? "put" : "post";

      await axios[method](endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFromDB();
      setShowToast(true);
      setIsModalOpen(false);
      resetForm();
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-2">
        <Loader2 className="text-orange-600 animate-spin" size={24} />
        <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">
          HallyTrack Link
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-10 font-sans text-left selection:bg-orange-600/30">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            HallyTrack{" "}
            <span className="text-orange-600 not-italic">Intelligence</span>
          </h1>
          <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em] mt-1 mb-8">
            System Uplink: Active
          </p>

          <div className="bg-zinc-950 p-1 rounded-xl inline-flex gap-1 border border-white/5 backdrop-blur-md">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-all"
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-lg text-[9px] font-black uppercase bg-orange-600 text-white shadow-lg shadow-orange-600/20">
              <Table size={14} /> Reports
            </button>
            <button
              onClick={() => navigate("/create-card")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-all"
            >
              <CreditCard size={14} /> Card
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/5 border border-red-900/20 rounded-xl group hover:bg-red-600 hover:border-red-600 transition-all shadow-lg"
        >
          <span className="text-[8px] font-black uppercase tracking-widest text-red-500 group-hover:text-white transition-colors">
            Terminate Session
          </span>
          <LogOut
            size={12}
            className="text-red-500 group-hover:text-white transition-colors"
            strokeWidth={3}
          />
        </button>
      </div>

      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-orange-600 px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl border border-white/10">
          <CheckCircle2 size={16} />{" "}
          <span className="font-black text-[10px] uppercase tracking-widest">
            Entry Verified
          </span>
        </div>
      )}

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight uppercase italic">
            Order Database
          </h2>
          <p className="text-zinc-600 text-[8px] font-black tracking-[0.3em] uppercase mt-1">
            Global Transaction Ledger
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              size={14}
            />
            <input
              type="text"
              placeholder="QUERY DATABASE..."
              className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-[10px] font-bold outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-500 px-6 py-2.5 rounded-lg flex items-center gap-2 font-black transition-all text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>
      </header>

      <main className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-white text-black font-black uppercase border-b border-white/5">
              <tr>
                <th className="px-8 py-4 text-[8px]">S.NO</th>
                <th className="px-6 py-4 text-[8px]">MANIFEST ID</th>
                <th className="px-6 py-4 text-[8px]">LEGAL NAME</th>
                <th className="px-6 py-4 text-[8px]">STATUS</th>
                <th className="px-6 py-4 text-[8px]">STATUS CONTROL</th>
                <th className="px-6 py-4 text-[8px] text-center">COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.length > 0 ? (
                filteredReports.map((order, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-900/50 transition-all group"
                  >
                    <td className="px-8 py-4 text-zinc-700 font-mono text-[9px]">
                      {order.sNo}
                    </td>
                    <td className="px-6 py-4 font-black text-white text-[10px] tracking-tighter">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-300 uppercase text-[10px]">
                      {order.customerName}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-[7px] font-black uppercase tracking-widest ${
                          order.status === "Finished"
                            ? "bg-green-600/20 text-green-500"
                            : order.status === "Processing"
                            ? "bg-blue-600/20 text-blue-500"
                            : "bg-orange-600/20 text-orange-500"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() =>
                            handleStatusChange(order.dbId, "Pending")
                          }
                          title="Set to Pending"
                          className={`p-1.5 rounded transition-all ${
                            order.status === "Pending"
                              ? "bg-orange-600 text-white"
                              : "bg-zinc-900 text-zinc-600 hover:bg-zinc-800"
                          }`}
                        >
                          <Clock size={12} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(order.dbId, "Processing")
                          }
                          title="Set to Processing"
                          className={`p-1.5 rounded transition-all ${
                            order.status === "Processing"
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-900 text-zinc-600 hover:bg-zinc-800"
                          }`}
                        >
                          <Play size={12} />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(order.dbId, "Finished")
                          }
                          title="Set to Finished"
                          className={`p-1.5 rounded transition-all ${
                            order.status === "Finished"
                              ? "bg-green-600 text-white"
                              : "bg-zinc-900 text-zinc-600 hover:bg-zinc-800"
                          }`}
                        >
                          <CheckCircle size={12} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 bg-zinc-900 hover:bg-orange-600 text-zinc-600 hover:text-white rounded-md border border-white/5"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order.orderId)}
                          className="p-2 bg-zinc-900 hover:bg-white hover:text-black text-zinc-600 rounded-md border border-white/5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-24 text-center text-zinc-800 text-[8px] font-black uppercase tracking-[0.4em]"
                  >
                    Query returned zero results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-full text-zinc-700 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-black tracking-tighter italic uppercase mb-10 text-white">
              {editingId ? `Edit Entry: ${editingId}` : "Create System Order"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-12">
              <section>
                <h3 className="text-orange-600 text-[8px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-orange-600"></div> 01. Client
                  Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "First name", val: "firstName" },
                    { label: "Last name", val: "lastName" },
                    { label: "Email id", val: "email", type: "email" },
                    { label: "Phone", val: "phone" },
                    { label: "City", val: "city" },
                    { label: "Postal Code", val: "postalCode" },
                  ].map((f) => (
                    <div key={f.val} className="space-y-1.5">
                      <label className="text-[7px] uppercase font-black text-zinc-600 ml-1 tracking-widest">
                        {f.label}
                      </label>
                      <input
                        type={f.type || "text"}
                        required
                        className="w-full bg-black border border-white/5 rounded-lg p-3 text-[10px] font-bold outline-none focus:border-orange-600 transition-all text-zinc-300"
                        value={formData[f.val]}
                        onChange={(e) =>
                          setFormData({ ...formData, [f.val]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[7px] uppercase font-black text-zinc-600 ml-1 tracking-widest">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-black border border-white/5 rounded-lg p-3 text-[10px] font-bold outline-none focus:border-orange-600 transition-all text-zinc-300"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-orange-600 text-[8px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-orange-600"></div> 02.
                  Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[7px] uppercase font-black text-zinc-600 ml-1 tracking-widest">
                      Product Module
                    </label>
                    <select
                      className="w-full bg-black border border-white/5 rounded-lg p-3 text-[10px] font-bold outline-none focus:border-orange-600 text-zinc-300"
                      value={formData.product}
                      onChange={(e) =>
                        setFormData({ ...formData, product: e.target.value })
                      }
                    >
                      {[
                        "HallyTrack Core Fiber",
                        "HallyTrack 5G Plan",
                        "HallyTrack Gbps Pro",
                        "Business Module 500",
                      ].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[7px] uppercase font-black text-zinc-600 ml-1 tracking-widest">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full bg-black border border-white/5 rounded-lg p-3 text-[10px] font-bold outline-none focus:border-orange-600 transition-all text-zinc-300"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[7px] uppercase font-black text-zinc-600 ml-1 tracking-widest">
                      Unit Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full bg-black border border-white/5 rounded-lg p-3 text-[10px] font-bold outline-none focus:border-orange-600 transition-all text-zinc-300"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, unitPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 bg-zinc-900 border border-white/5 p-4 rounded-lg flex justify-between items-center">
                  <span className="text-[7px] font-black text-orange-600 uppercase tracking-[0.3em]">
                    Net Amount
                  </span>
                  <span className="font-black text-lg italic text-white">
                    ${Number(formData.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </section>

              <button
                type="submit"
                className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] tracking-[0.4em] uppercase hover:bg-orange-600 hover:text-white transition-all shadow-xl"
              >
                {editingId ? "Push Update" : "Initialize Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 p-10 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-white/5 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-black mb-1 italic uppercase tracking-tighter text-white">
              Purge System Record?
            </h3>
            <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em] mb-8">
              ENTRY ID: {orderToDelete}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-lg bg-zinc-900 text-white font-black text-[9px] uppercase border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 rounded-lg bg-orange-600 text-white font-black text-[9px] uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
