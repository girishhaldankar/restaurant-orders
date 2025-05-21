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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    priceAC: "",
    priceNonAC: "",
    category: "",
    image: "", // Just a filename like "vegfriedrice.jpg"
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

  const uploadImageToServer = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Image upload failed");
    return null;
  }

  const data = await res.json();
  return data.filename;
};


 const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (name === "image" && files.length > 0) {
    const file = files[0];
    setFormData((prev) => ({
      ...prev,
      image: `${Date.now()}_${file.name}`,
      imageFile: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};



  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.priceAC || !formData.priceNonAC) return;

  let uploadedImageName = formData.image;

  if (formData.imageFile) {
    const uploaded = await uploadImageToServer(formData.imageFile);
    if (uploaded) {
      uploadedImageName = uploaded;
    }
  }

  const itemData = {
    name: formData.name,
    priceAC: formData.priceAC,
    priceNonAC: formData.priceNonAC,
    category: formData.category,
    image: uploadedImageName, // ✅ actual filename from upload
  };

  if (editItem) {
    const refDoc = doc(db, "menuItems", editItem.id);
    await updateDoc(refDoc, itemData);
  } else {
    await addDoc(menuCollection, itemData);
  }

  const snapshot = await getDocs(menuCollection);
  const itemsData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  setItems(itemsData);

  setFormData({ name: "", priceAC: "", priceNonAC: "", category: "", image: "", imageFile: null });
  setPreviewUrl(null);
  setEditItem(null);
};


  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      priceAC: item.priceAC,
      priceNonAC: item.priceNonAC,
      category: item.category,
      image: item.image || "",
    });
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
          {previewUrl && (
  <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />
)}
          <p className="text-sm text-gray-500">
            After selecting a file, manually copy it to: <code>public/menuImages/</code>
          </p>

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
          <ul className="divide-y divide-gray-200">
            {groupedItems[category].map((item) => (
              <li key={item.id} className="py-3 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={`/menuImages/${item.image || "default.jpg"}`}
                      alt={item.name}
                      onError={(e) =>
                        (e.currentTarget.src = "/menuImages/default.jpg")
                      }
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
                    AC: ₹{item.priceAC}
                    <br />
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
