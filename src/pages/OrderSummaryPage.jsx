import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const OrderSummaryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const now = new Date();
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(now.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(startOfYesterday))
      );
      const snapshot = await getDocs(q);
      const result = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setOrders(result);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, { status: newStatus });
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const printPage = () => window.print();

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 print:p-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Order Summary</h1>
        <button
          onClick={printPage}
          className="bg-blue-500 text-white px-4 py-2 rounded print:hidden"
        >
          Print
        </button>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="border rounded p-4 mb-4 shadow bg-white"
          >
            <div className="mb-2">
              <strong>Table:</strong> {order.tableNumber}{' '}
              <span className="text-gray-600 text-sm ml-2">
                ({order.createdAt.toLocaleString()})
              </span>
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span
                className={`font-semibold ${
                  order.status === 'served'
                    ? 'text-green-600'
                    : order.status === 'cancelled'
                    ? 'text-red-500'
                    : 'text-yellow-600'
                }`}
              >
                {order.status}
              </span>
            </div>

            <ul className="mt-2 list-disc pl-5">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} × {item.quantity}{' '}
                  {item.notes && (
                    <span className="text-sm text-gray-500">
                      (Notes: {item.notes})
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex space-x-2 print:hidden">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus(order.id, 'served')}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Mark as Served
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, 'cancelled')}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderSummaryPage;
