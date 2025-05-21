import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const AdminMenuPage = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    priceAC: "",
    priceNonAC: "",
    category: "",
    image: "",
  });
  const [editItem, setEditItem] = useState(null);

  const menuCollection = collection(db, "menuItems");

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(menuCollection);
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
    };
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.priceAC || !formData.priceNonAC) return;

    if (editItem) {
      const ref = doc(db, "menuItems", editItem.id);
      await updateDoc(ref, formData);
    } else {
      await addDoc(menuCollection, formData);
    }

    const snapshot = await getDocs(menuCollection);
    const itemsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setItems(itemsData);

    setFormData({ name: "", priceAC: "", priceNonAC: "", category: "", image: "" });
    setEditItem(null);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData(item);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this item?")) {
      await deleteDoc(doc(db, "menuItems", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    acc[cat] = acc[cat] || [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 border mb-8">
        <h1 className="text-xl font-bold mb-4">
          {editItem ? "Edit Menu Item" : "Add Menu Item"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="priceAC"
            placeholder="Price (AC Room)"
            value={formData.priceAC}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="priceNonAC"
            placeholder="Price (Non-AC Room)"
            value={formData.priceNonAC}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Category (optional) --</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Starters">Starters</option>
            <option value="Main Course">Main Course</option>
            <option value="Desserts">Desserts</option>
            <option value="Drinks">Drinks</option>
          </select>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {editItem ? "Update" : "Add"}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold mb-2">Menu Items</h2>

      {Object.keys(groupedItems).map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-md font-bold text-gray-700 mb-2">{category}</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {groupedItems[category].map((item) => (
              <li key={item.id} className="py-3 sm:py-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="shrink-0">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 capitalize truncate">
                      {item.category}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700">
                    AC: ₹{item.priceAC}<br />
                    Non-AC: ₹{item.priceNonAC}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AdminMenuPage;
