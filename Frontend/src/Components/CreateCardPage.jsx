import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Table,
  CreditCard,
  Plus,
  Image as ImageIcon,
  Package,
  ArrowLeft,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut,
} from "lucide-react";

const CreateCardPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Connectivity",
    description: "",
    image: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      const payload = { ...formData, price: Number(formData.price) };
      let res;

      if (editingId) {
        res = await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          payload
        );
      } else {
        res = await axios.post("http://localhost:5000/api/products", payload);
      }

      if (res.status === 201 || res.status === 200) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchProducts();
        resetForm();
      }
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const startEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || "Connectivity",
      description: product.description || "",
      image: product.image_url,
    });
    setEditingId(product.id);
    setView("create");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "Connectivity",
      description: "",
      image: null,
    });
    setEditingId(null);
    setView("list");
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${deleteConfirm}`);
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      setDeleteConfirm(null);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-2">
        <Loader2 className="text-orange-600 animate-spin" size={24} />
        <p className="text-zinc-800 text-[8px] font-black uppercase tracking-[0.4em]">
          HallyTrack Link
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-orange-600/30">
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2 rounded-full border border-orange-600 shadow-2xl">
          <CheckCircle2 size={12} className="text-orange-600" />
          <span className="font-bold uppercase text-[8px] tracking-[0.2em]">
            Intel Updated
          </span>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-[#080808] border border-white/5 p-8 rounded-[2rem] max-w-xs w-full text-center">
            <AlertTriangle className="text-orange-600 mx-auto mb-4" size={24} />
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 italic">
              Confirm Purge
            </h3>
            <p className="text-zinc-600 text-[8px] font-bold uppercase mb-8">
              Removal from HallyTrack database.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-orange-600 rounded-xl font-black uppercase text-[9px]"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-zinc-900 rounded-xl font-black uppercase text-[9px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
            HALLYTRACK{" "}
            <span className="text-orange-600 not-italic">INTELLIGENCE</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-zinc-700 text-[8px] font-black uppercase tracking-[0.4em]">
              SYSTEM UPLINK: ACTIVE
            </p>
            <div className="w-1 h-1 rounded-full bg-orange-600 animate-pulse" />
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
      </header>

      <nav className="flex items-center gap-1 mb-12 bg-[#0a0a0a] p-1.5 rounded-2xl w-fit border border-white/5 shadow-2xl">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase text-zinc-600 hover:text-white transition-all"
        >
          <LayoutDashboard size={14} strokeWidth={2.5} /> DASHBOARD
        </button>
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase text-zinc-600 hover:text-white transition-all"
        >
          <Table size={14} strokeWidth={2.5} /> REPORTS
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase bg-orange-600 text-white shadow-lg">
          <CreditCard size={14} strokeWidth={2.5} /> CARD
        </button>
      </nav>

      <main>
        {view === "list" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#080808] p-8 rounded-[2rem] border border-white/5">
              <div>
                <h2 className="text-[11px] font-black italic tracking-tighter uppercase">
                  Asset Grid
                </h2>
                <p className="text-zinc-700 text-[7px] font-black uppercase tracking-[0.3em] mt-1">
                  {products.length} Units Online
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setView("create");
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-[9px] hover:bg-orange-600 hover:text-white transition-all"
              >
                <Plus size={14} /> Initialize Asset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#080808] border border-white/5 rounded-[2rem] overflow-hidden group relative transition-all hover:border-orange-600/30"
                >
                  <div className="aspect-square bg-black relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={product.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-900">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-3 bg-white text-black rounded-lg hover:bg-orange-600 hover:text-white transition-all"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-3 bg-zinc-900 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[7px] text-orange-600 font-black uppercase tracking-[0.2em] mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-bold text-[9px] text-white uppercase truncate">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                      <span className="text-[11px] font-black text-white">
                        ${product.price}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-orange-600 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto relative">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 text-zinc-700 hover:text-white mb-6 font-black uppercase text-[8px] tracking-[0.3em] transition-all"
            >
              <ArrowLeft size={12} /> Back to Grid
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="relative z-20 bg-[#080808] border border-white/5 p-8 rounded-[2rem] space-y-6">
                <form onSubmit={handlePublish} className="space-y-4">
                  <div>
                    <label className="text-[7px] font-black uppercase text-zinc-700 ml-1 tracking-widest">
                      Nomenclature
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 mt-1 text-[10px] focus:border-orange-600/50 outline-none uppercase font-bold text-white"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[7px] font-black uppercase text-zinc-700 ml-1 tracking-widest">
                        Credits ($)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 mt-1 text-[10px] focus:border-orange-600/50 outline-none font-bold text-white"
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[7px] font-black uppercase text-zinc-700 ml-1 tracking-widest">
                        Class
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 mt-1 text-[10px] focus:border-orange-600/50 outline-none uppercase font-black cursor-pointer text-white"
                      >
                        <option>Connectivity</option>
                        <option>Security</option>
                        <option>Storage</option>
                        <option>Developer Tools</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[7px] font-black uppercase text-zinc-700 ml-1 tracking-widest">
                      Specifications
                    </label>
                    <textarea
                      value={formData.description}
                      className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 mt-1 text-[10px] focus:border-orange-600/50 outline-none min-h-[80px] text-white"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="relative group/file">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-black border border-dashed border-white/5 rounded-xl p-6 text-center group-hover:border-orange-600/40 transition-all">
                      <ImageIcon
                        className="mx-auto mb-2 text-zinc-900"
                        size={16}
                      />
                      <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700">
                        Update Visual Identity
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all shadow-2xl relative z-30 active:scale-[0.98]"
                  >
                    {editingId ? "Update Deployment" : "Finalize Deployment"}
                  </button>
                </form>
              </div>

              <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-black border border-white/5 rounded-[2rem] border-dashed pointer-events-none relative z-10">
                <div className="w-full max-w-[240px] bg-[#080808] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto">
                  <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <Package size={32} className="text-zinc-900" />
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-[7px] font-black text-orange-600 uppercase tracking-widest mb-2">
                      {formData.category}
                    </p>
                    <h3 className="text-[10px] font-black tracking-tighter text-white mb-3 uppercase truncate leading-tight">
                      {formData.name || "Module Null"}
                    </h3>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-sm font-black text-white">
                        ${formData.price || "0"}
                      </span>
                      <div className="px-2 py-0.5 bg-orange-600/10 border border-orange-600/20 text-orange-600 text-[6px] font-black uppercase rounded">
                        LIVE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateCardPage;
