"use client";
import { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";




function getSessionId() {
  if (typeof window === "undefined") return "";
  const k = "sc_session";
  let v = localStorage.getItem(k);
  if (!v) {
    v = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    localStorage.setItem(k, v);
  }
  return v;
}

export default function ProductCard({ p }: { p: any }) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => { setSessionId(getSessionId()); }, []);

  async function addToCart() {
    if (!sessionId) return;
    setBusy(true);
    const query = `
      mutation Add($sessionId: ID!, $productId: ID!, $sku: String!, $qty: Int!) {
        addToCart(sessionId: $sessionId, productId: $productId, sku: $sku, qty: $qty) {
          totalCents
        }
      }`;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { sessionId, productId: p.id, sku: (p.slug || "SKU").toUpperCase(), qty: 1 }
      })
    });
    setBusy(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  return (
    <li style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      {p.mainImageUrl && <img src={p.mainImageUrl} alt={p.title} style={{ width: "100%", borderRadius: 8 }} />}
      <h3 style={{ marginBottom: 4 }}>{p.title}</h3>
      <p style={{ marginTop: 0, color: "#555" }}>{p.description}</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <strong>{(p.priceCents/100).toFixed(2)} {p.currency}</strong>
        <button
          onClick={addToCart}
          disabled={busy}
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: added ? "#e6ffed" : "#f8f8f8",
            cursor: "pointer"
          }}
        >
          {busy ? "Adding..." : added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </li>
  );
}
