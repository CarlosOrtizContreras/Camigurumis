// src/context/CartContext.jsx
import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { amigurumi, personalizacion:{parteId, colorId}, cantidad, precioUnitario }

  function addItem(amigurumi, personalizacion = {}, cantidad = 1) {
    setItems(prev => {
      const key = amigurumi.idAmigurumi + JSON.stringify(personalizacion);
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i);
      }
      return [...prev, { key, amigurumi, personalizacion, cantidad, precioUnitario: amigurumi.precioBase }];
    });
  }

  function removeItem(key) {
    setItems(prev => prev.filter(i => i.key !== key));
  }

  function clearCart() { setItems([]); }

  const total = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
