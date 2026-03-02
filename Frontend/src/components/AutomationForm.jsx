import { useState } from "react";
import axios from "axios";

const AutomationForm = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/products/smart-create",
        { name, price }
      );

      alert("Product created successfully!");
      setTitle("");
      setPrice("");
    } catch (err) {
      console.error(err);
      alert("Error creating product");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Product Automation</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name (e.g., Men Black Hoodie)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Base Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Auto Create Product"}
        </button>
      </form>
    </div>
  );
};

export default AutomationForm;