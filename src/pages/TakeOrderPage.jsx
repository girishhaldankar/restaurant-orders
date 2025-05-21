import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const TakeOrderPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [isAC, setIsAC] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      const snapshot = await getDocs(collection(db, 'menuItems'));
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
    };

    fetchMenu();
  }, []);

  const handleAddToOrder = (item) => {
    const price = isAC ? item.priceAC : item.priceNonAC;

    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(prev =>
        prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems(prev => [
        ...prev,
        { ...item, quantity: 1, notes: '', price },
      ]);
    }
  };

  const handleQuantityChange = (id, delta) => {
    setSelectedItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );
  };

  const handleNoteChange = (id, value) => {
    setSelectedItems(prev =>
      prev.map(i => (i.id === id ? { ...i, notes: value } : i))
    );
  };

  const totalAmount = selectedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!tableNumber.trim()) return alert('Please enter table number');
    if (selectedItems.length === 0) return alert('Add items to order');

    const orderData = {
      tableNumber,
      isAC,
      items: selectedItems,
      total: totalAmount,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'orders'), orderData);
    alert('Order submitted!');
    navigate('/order-summary');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Take Order</h2>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Table Number"
          value={tableNumber}
          onChange={e => setTableNumber(e.target.value)}
          className="border p-2"
        />
        <label>
          <input
            type="checkbox"
            checked={isAC}
            onChange={e => setIsAC(e.target.checked)}
            className="mr-1"
          />
          AC Room
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {menuItems.map(item => (
          <div key={item.id} className="border p-3 rounded shadow-sm">
            <div className="font-semibold">{item.name}</div>
            <div>
              ₹{isAC ? item.priceAC : item.priceNonAC} —{' '}
              {item.isVeg ? 'Veg' : 'Non-Veg'}
            </div>
            <button
              onClick={() => handleAddToOrder(item)}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Selected Items</h3>
      {selectedItems.length === 0 ? (
        <p>No items selected.</p>
      ) : (
        selectedItems.map(item => (
          <div key={item.id} className="mb-2 border p-2 rounded">
            <div className="flex justify-between">
              <div>{item.name} — ₹{item.price * item.quantity}</div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
              </div>
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={item.notes}
              onChange={e => handleNoteChange(item.id, e.target.value)}
              className="w-full mt-2 border p-1"
            />
          </div>
        ))
      )}

      <div className="text-xl font-bold mt-4 mb-4">Total: ₹{totalAmount}</div>
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Order
      </button>
    </div>
  );
};

export default TakeOrderPage;
