import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const MenuListPage = () => {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAC, setShowAC] = useState(true); // Toggle for AC/Non-AC

  const menuCollection = collection(db, "menuItems");

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(menuCollection);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    };
    fetchItems();
  }, []);

  const groupedItems = items
    .filter(item => {
      const matchCategory = category === "All" || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    })
    .reduce((acc, item) => {
      const cat = item.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <select
            className="border p-2 rounded w-full sm:w-auto"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Starters">Starters</option>
            <option value="Main Course">Main Course</option>
            <option value="Desserts">Desserts</option>
            <option value="Drinks">Drinks</option>
          </select>

          <input
            type="text"
            placeholder="Search items..."
            className="border p-2 rounded w-full sm:w-1/2"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <div className="flex justify-center mb-4">
  <div className="inline-flex rounded-full bg-gray-200 p-1 shadow-inner">
    <button
      onClick={() => setShowAC(false)}
      className={`px-4 py-1 rounded-full transition font-medium ${
        !showAC ? "bg-blue-600 text-white" : "text-gray-700"
      }`}
    >
      Non-AC
    </button>
    <button
      onClick={() => setShowAC(true)}
      className={`px-4 py-1 rounded-full transition font-medium ${
        showAC ? "bg-blue-600 text-white" : "text-gray-700"
      }`}
    >
      AC
    </button>
  </div>
</div>

        </div>

        {Object.entries(groupedItems).map(([catName, catItems]) => (
          <div key={catName} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{catName}</h2>
            <ul className="divide-y divide-gray-300">
              {catItems.map(item => (
                <li key={item.id} className="py-4 flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-900">{item.name}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.category === "Veg"
                          ? "bg-green-600"
                          : item.category === "Non-Veg"
                          ? "bg-red-600"
                          : "bg-gray-400"
                      }`}
                      title={item.category}
                    ></div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₹
                      {showAC
                        ? item.priceAC || item.price || "-"
                        : item.priceNonAC || item.price || "-"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuListPage;
