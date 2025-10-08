"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

function getOrCreateSessionId() {
  const k = "sc_session";
  try {
    let v = localStorage.getItem(k);
    if (!v) {
      v = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "";
  }
}

export default function CartPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string>("");

  // 1) Ensure we have a session id on the client
  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
  }, []);

  // 2) Fetch the cart once sessionId is available
  useEffect(() => {
    if (!sessionId) return;
    let aborted = false;

    async function fetchCart() {
      setLoading(true);
      setErrMsg("");
      try {
        const query = `
          query Cart($sessionId: ID!) {
            cart(sessionId: $sessionId) {
              id sessionId totalCents currency
              items { id quantity unitPrice subtotal product { id title mainImageUrl } }
            }
          }`;
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { sessionId } })
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!aborted) setCart(json.data.cart);
      } catch (e: any) {
        console.error("Cart fetch failed:", e);
        if (!aborted) setErrMsg(e?.message ?? "Failed to fetch cart");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchCart();
    return () => { aborted = true; };
  }, [sessionId]);

  async function updateItem(itemId: string, qty: number) {
    try {
      const mutation = `
        mutation Upd($sessionId: ID!, $itemId: ID!, $qty: Int!) {
          updateCartItem(sessionId: $sessionId, itemId: $itemId, qty: $qty) {
            totalCents currency
            items { id quantity unitPrice subtotal product { id title mainImageUrl } }
          }
        }`;
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables: { sessionId, itemId, qty } })
      });
      const json = await res.json();
      setCart(json.data.updateCartItem);
    } catch (e) { console.error(e); }
  }

  async function removeItem(itemId: string) {
    try {
      const mutation = `
        mutation Rem($sessionId: ID!, $itemId: ID!) {
          removeCartItem(sessionId: $sessionId, itemId: $itemId) {
            totalCents currency
            items { id quantity unitPrice subtotal product { id title mainImageUrl } }
          }
        }`;
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables: { sessionId, itemId } })
      });
      const json = await res.json();
      setCart(json.data.removeCartItem);
    } catch (e) { console.error(e); }
  }

  if (!sessionId) return <p>Preparing session…</p>;
  if (loading) return <p>Loading cart…</p>;
  if (errMsg) return <p>Cart error: {errMsg}. Check API is running and CORS allows http://localhost:3001</p>;

  return (
    <div>
      <h1>SmartCart</h1>
      <h2>Your cart</h2>
      {cart.items.length === 0 ? (
        <p>Cart is empty. <a href="/">Shop products →</a></p>
      ) : (
        <ul style={{ display: "grid", gap: 12, padding: 0 }}>
          {cart.items.map((it: any) => (
            <li key={it.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, listStyle: "none", display: "flex", gap: 12 }}>
              {it.product.mainImageUrl && <img src={it.product.mainImageUrl} alt="" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover" }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{it.product.title}</div>
                <div style={{ color: "#666" }}>Unit {(it.unitPrice/100).toFixed(2)} {cart.currency}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <button onClick={() => updateItem(it.id, Math.max(0, it.quantity - 1))}>−</button>
                  <span>{it.quantity}</span>
                  <button onClick={() => updateItem(it.id, it.quantity + 1)}>+</button>
                  <button onClick={() => removeItem(it.id)} style={{ marginLeft: "auto" }}>Remove</button>
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>{(it.subtotal/100).toFixed(2)} {cart.currency}</div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Total: {(cart.totalCents/100).toFixed(2)} {cart.currency}</strong>
        <a href="#" onClick={(e) => { e.preventDefault(); alert("Checkout coming next (Stripe)"); }} style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10 }}>Checkout →</a>
      </div>
    </div>
  );
}
