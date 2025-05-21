import { useState, useEffect } from "react";

const categories = [
  "veg",
  "non-veg",
  "starter",
  "main course",
  "dessert",
  "beverage",
];

export default function AddMenuForm({ onSubmit, editItem }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setPrice(editItem.price);
      setCategory(editItem.category);
      setImage(editItem.image);
    } else {
      setName("");
      setPrice("");
      setCategory("");
      setImage("");
    }
  }, [editItem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !category || !image) {
      alert("Please fill all fields.");
      return;
    }

    const newItem = {
      id: editItem?.id || Date.now(),
      name,
      price,
      category,
      image,
    };
    onSubmit(newItem);
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow-md space-y-4"
    >
      <div>
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Price (₹)</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Category</label>
        <select
          className="w-full border rounded p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {image && (
          <img
            src={image}
            alt="Preview"
            className="mt-2 w-32 h-32 object-cover rounded"
          />
        )}
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {editItem ? "Update" : "Add"} Item
      </button>
    </form>
  );
}
