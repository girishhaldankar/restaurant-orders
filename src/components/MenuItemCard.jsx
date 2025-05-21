import { useState, useEffect } from "react";
import AddMenuForm from "../components/AddMenuForm";
import MenuItemCard from "../components/MenuItemCard";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const itemsCollection = collection(db, "menuItems");

  // Fetch items on load
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const snapshot = await getDocs(itemsCollection);
    const data = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setItems(data);
  };

  const handleAdd = async (newItem) => {
    const docRef = await addDoc(itemsCollection, newItem);
    setItems([...items, { ...newItem, id: docRef.id }]);
  };

  const handleUpdate = async (updatedItem) => {
    const itemRef = doc(db, "menuItems", updatedItem.id);
    await updateDoc(itemRef, updatedItem);
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    const itemRef = doc(db, "menuItems", id);
    await deleteDoc(itemRef);
    setItems(items.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {
    setEditItem(item);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Menu</h1>

      {/* Add/Edit Form */}
      <AddMenuForm
        onSubmit={editItem ? handleUpdate : handleAdd}
        editItem={editItem}
      />

      {/* Menu Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
