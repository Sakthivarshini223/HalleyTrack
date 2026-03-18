import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingBag,
  Search,
  LogOut,
  Plus,
  ShoppingCart,
  ArrowRight,
  Star,
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchLiveInventory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data);
        localStorage.setItem(
          "live_products_meta",
          JSON.stringify(response.data.map((p) => p.id || p.product_id))
        );
      } catch (err) {
        const savedProducts = localStorage.getItem("live_products");
        if (savedProducts) setProducts(JSON.parse(savedProducts));
      }
    };
    fetchLiveInventory();
    const savedCart = localStorage.getItem("user_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const addToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem("user_cart") || "[]");
    const productToAdd = {
      id: product.id || product.product_id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.image,
    };
    const updatedCart = [...currentCart, productToAdd];
    localStorage.setItem("user_cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600/40">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-orange-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between sticky top-0">
        <div className="flex items-center">
          <h1
            className="text-xl font-black tracking-tighter italic cursor-pointer"
            onClick={() => navigate("/user-dashboard")}
          >
            HALLEY<span className="text-orange-600 not-italic">TRACK</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="relative group hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search..."
              className="bg-zinc-900/80 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-[11px] outline-none focus:border-orange-600 transition-all w-40 md:w-64"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300 hover:text-orange-500 hover:border-orange-500/50 transition-all"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-600 text-[9px] font-bold rounded-full flex items-center justify-center border border-black">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("halley_token");
                localStorage.removeItem("user_email");
                navigate("/");
              }}
              className="p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-500 hover:text-white hover:bg-orange-600 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 p-4 md:p-8 max-w-[1400px] mx-auto">
        <header className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
            Live <span className="text-orange-600 italic">Inventory</span>
          </h2>
          <div className="h-1 w-12 bg-orange-600 mt-2"></div>
        </header>

        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-zinc-900/20">
            <ShoppingBag className="text-zinc-800 mb-2" size={48} />
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px]">
              System Offline / No Results
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id || product.product_id}
                className="group bg-zinc-900/40 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden hover:border-orange-600/50 transition-all duration-300"
              >
                <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden">
                  {product.image_url || product.image ? (
                    <img
                      src={product.image_url || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <ShoppingBag size={32} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-orange-600 text-white p-3 rounded-xl font-bold shadow-2xl hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-3 md:p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-xs md:text-sm truncate uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[9px] font-bold">4.9</span>
                    </div>
                  </div>

                  <p className="text-zinc-500 text-[10px] line-clamp-1 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-bold text-zinc-600">
                        Price
                      </span>
                      <span className="text-sm md:text-lg font-black text-white">
                        ${product.price}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-orange-600 hover:text-white transition-all"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
