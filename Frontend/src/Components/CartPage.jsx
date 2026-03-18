import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Package,
  MapPin,
} from "lucide-react";
import axios from "axios";

const CartPage = () => {
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [addressData, setAddressData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("user_cart");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };
    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price), 0);
  const tax = subtotal * 0.01;
  const total = subtotal + tax;

  const removeItem = (indexToRemove) => {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem("user_cart", JSON.stringify(updatedCart));
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;

    if (!addressData.firstName || !addressData.street || !addressData.phone) {
      alert("Required: Name, Phone, and Street.");
      return;
    }

    setLoading(true);
    const userEmail =
      localStorage.getItem("user_email") || localStorage.getItem("email");
    const token = localStorage.getItem("halley_token");

    try {
      const orderData = {
        email: userEmail,
        totalAmount: Number(total.toFixed(2)),
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        phone: addressData.phone,
        address: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: 1,
          price: Number(item.price),
        })),
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setIsOrdered(true);
        localStorage.removeItem("user_cart");
      }
    } catch (error) {
      alert(
        `Error: ${
          error.response?.data?.message ||
          "Connection failed - Check if Backend is running"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full">
          <div className="w-20 h-20 bg-orange-600/10 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">
            Order Secured
          </h1>
          <p className="text-zinc-500 mb-8 text-[9px] font-bold uppercase tracking-widest">
            Transaction Logged Successfully
          </p>
          <button
            onClick={() => navigate("/user-dashboard")}
            className="w-full py-3 bg-white text-black text-[10px] font-black rounded-xl hover:bg-orange-600 hover:text-white transition-all uppercase tracking-widest"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans selection:bg-orange-600/30">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/user-dashboard")}
          className="flex items-center gap-2 text-zinc-600 hover:text-orange-500 mb-8 text-[9px] font-black tracking-widest transition-all"
        >
          <ArrowLeft size={14} /> BACK TO STORE
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7 space-y-10">
            <section>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 italic">
                Checkout <span className="text-orange-600">Manifest</span>
              </h2>
              <div className="space-y-3">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center border border-white/5 rounded-3xl bg-zinc-900/20">
                    <Package className="mx-auto text-zinc-800 mb-2" size={32} />
                    <p className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest">
                      Cart is empty
                    </p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-orange-600/20 transition-all"
                    >
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex-shrink-0 flex items-center justify-center text-zinc-600">
                        <Package size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[11px] uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <p className="text-zinc-600 text-[8px] font-mono uppercase">
                          SKU: {item.id}
                        </p>
                      </div>
                      <p className="font-black text-white text-xs">
                        ${item.price}
                      </p>
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-zinc-700 hover:text-orange-600 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-zinc-900/20 border border-white/5 p-6 md:p-8 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-orange-600" size={18} />
                <h3 className="font-black uppercase italic text-sm tracking-tight">
                  Delivery Logistics
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-zinc-600 uppercase ml-1">
                    Recipient
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-[10px] outline-none focus:border-orange-600 transition-all"
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          firstName: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-[10px] outline-none focus:border-orange-600 transition-all"
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-zinc-600 uppercase ml-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-[10px] outline-none focus:border-orange-600 transition-all"
                    onChange={(e) =>
                      setAddressData({ ...addressData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[8px] font-black text-zinc-600 uppercase ml-1">
                    Destination Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-[10px] outline-none focus:border-orange-600 transition-all"
                    onChange={(e) =>
                      setAddressData({ ...addressData, street: e.target.value })
                    }
                  />
                </div>
                <input
                  type="text"
                  placeholder="City"
                  className="bg-black border border-white/10 rounded-lg p-2.5 text-[10px] outline-none focus:border-orange-600 transition-all"
                  onChange={(e) =>
                    setAddressData({ ...addressData, city: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="State"
                  className="bg-black border border-white/10 rounded-lg p-2.5 text-[10px] outline-none focus:border-orange-600 transition-all"
                  onChange={(e) =>
                    setAddressData({ ...addressData, state: e.target.value })
                  }
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 h-fit sticky top-10">
            <div className="bg-zinc-900/50 p-6 md:p-8 rounded-[2.5rem] border border-white/5">
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  <span>Service Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                    Total Credits
                  </span>
                  <span className="text-3xl font-black text-orange-600 tracking-tighter leading-none">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={loading || cartItems.length === 0}
                className={`w-full py-4 rounded-xl font-black tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all uppercase
                  ${
                    loading || cartItems.length === 0
                      ? "bg-zinc-800 text-zinc-600"
                      : "bg-orange-600 text-white hover:bg-white hover:text-black hover:scale-[1.02]"
                  }`}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard size={16} /> Authorize Order
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-zinc-600">
                <ShieldCheck size={12} />
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  Secure Terminal Session
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
