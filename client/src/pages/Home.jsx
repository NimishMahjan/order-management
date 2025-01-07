import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readCSV } from "../utils/csvReader.js";
import { useDispatch, useSelector } from "react-redux";
import { post } from "../Services/apiEndpoint.jsx";
import { Logout } from "../redux/authSlice.js";

function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  console.log(user);
  const SHEETBEST_URL =
    "https://api.sheetbest.com/sheets/8aa8106b-570a-465d-9c39-9f7fad53b1c0";

  const [orders, setOrders] = useState({
    "Order No": "",
    "Order IN Time": "",
    "Order Recived Date & Time": "",
    "Desired Delivery in Days": "",
    "Party Name": "",
    Station: "",
  });

  const [orderProducts, setOrderProducts] = useState([
    { product: "", quantity: "" },
  ]);

  const [stations, setStations] = useState([]);
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [lastOrderNumber, setLastOrderNumber] = useState("Tk000"); // Initialize the last order number

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stationsData = await readCSV("/data/stations.csv");
        const productsData = await readCSV("/data/products.csv");
        const partiesData = await readCSV("/data/parties.csv");

        setStations(stationsData.map((row) => row.name));
        setProducts(productsData.map((row) => row.name));
        setParties(partiesData.map((row) => row.name));
      } catch (error) {
        console.error("Error reading CSV files:", error);
      }
    };

    fetchData();
  }, []);

  const goToAdmin = () => {
    navigate("/admin");
  };

  const handleLogout = async () => {
    try {
      const request = await post("/api/auth/logout");
      const response = request.data;
      if (request.status === 200) {
        dispatch(Logout());
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOrderChange = (e) => {
    setOrders({ ...orders, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...orderProducts];
    updatedProducts[index][field] = value;
    setOrderProducts(updatedProducts);
  };

  const addProductRow = () => {
    setOrderProducts([...orderProducts, { product: "", quantity: "" }]);
  };

  const removeProductRow = (index) => {
    const updatedProducts = orderProducts.filter((_, i) => i !== index);
    setOrderProducts(updatedProducts);
  };

  // Helper function to generate the next order number
  const getNextOrderNumber = (currentOrderNumber) => {
    const numberPart = parseInt(currentOrderNumber.slice(2)) + 1;
    return `tk${numberPart.toString().padStart(3, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate the next order number
    const nextOrderNumber = getNextOrderNumber(lastOrderNumber);
    setOrders((prevOrders) => ({ ...prevOrders, "Order No": nextOrderNumber }));

    console.log("Orders being sent:", {
      ...orders,
      "Order No": nextOrderNumber,
    });
    console.log("Order Products:", orderProducts);

    try {
      const rowsToInsert = orderProducts.map((product) => ({
        ...orders,
        "Order No": nextOrderNumber,
        "Product Name": product.product,
        "Order Qty In NOS": product.quantity,
      }));

      for (const row of rowsToInsert) {
        const res = await fetch(SHEETBEST_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(row),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error response from API:", errorData);
          alert(`Error adding order: ${errorData.detail || "Unknown error"}`);
          return;
        }
      }

      console.log("Order added successfully");
      alert("Order added successfully!");
      navigate("/user");

      // Update last order number
      setLastOrderNumber(nextOrderNumber);

      // Reset form
      setOrders({
        "Order No": "",
        "Order IN Time": "",
        "Order Recived Date & Time": "",
        "Desired Delivery in Days": "",
        "Party Name": "",
        Station: "",
      });
      setOrderProducts([{ product: "", quantity: "" }]);
    } catch (err) {
      console.error("Error while adding order:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Add New Order</h1>
      <form onSubmit={handleSubmit} className="row g-3">
        {Object.keys(orders).map((field, index) =>
          [
            "Station",
            "Party Name",
            "Desired Delivery in Days",
            "Order No",
          ].includes(field) ? null : (
            <div className="col-md-6" key={index}>
              <label htmlFor={field} className="form-label">
                {field.replace(/_/g, " ")}
              </label>
              <input
                type={field.includes("Time") ? "datetime-local" : "text"}
                id={field}
                name={field}
                className="form-control"
                placeholder={field.replace(/_/g, " ")}
                value={orders[field]}
                onChange={handleOrderChange}
                required
              />
            </div>
          )
        )}

        <div className="col-md-6">
          <label htmlFor="Station" className="form-label">
            Station
          </label>
          <select
            id="Station"
            name="Station"
            className="form-control"
            value={orders.Station}
            onChange={handleOrderChange}
            required
          >
            <option value="" disabled>
              Select a Station
            </option>
            {stations.map((station, index) => (
              <option key={index} value={station}>
                {station}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="Party Name" className="form-label">
            Party Name
          </label>
          <select
            id="Party Name"
            name="Party Name"
            className="form-control"
            value={orders["Party Name"]}
            onChange={handleOrderChange}
            required
          >
            <option value="" disabled>
              Select a Party
            </option>
            {parties.map((party, index) => (
              <option key={index} value={party}>
                {party}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="Desired Delivery in Days" className="form-label">
            Desired Delivery in Days
          </label>
          <select
            id="Desired Delivery in Days"
            name="Desired Delivery in Days"
            className="form-control"
            value={orders["Desired Delivery in Days"]}
            onChange={handleOrderChange}
            required
          >
            <option value="" disabled>
              Select Days
            </option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <h4>Products</h4>
          {orderProducts.map((orderProduct, index) => (
            <div className="row g-3 align-items-center mb-2" key={index}>
              <div className="col-md-6">
                <label htmlFor={`product-${index}`} className="form-label">
                  Product
                </label>
                <select
                  id={`product-${index}`}
                  name="product"
                  className="form-control"
                  value={orderProduct.product}
                  onChange={(e) =>
                    handleProductChange(index, "product", e.target.value)
                  }
                  required
                >
                  <option value="" disabled>
                    Select a Product
                  </option>
                  {products.map((product, i) => (
                    <option key={i} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor={`quantity-${index}`} className="form-label">
                  Quantity
                </label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  name="quantity"
                  className="form-control"
                  placeholder="Quantity"
                  value={orderProduct.quantity}
                  onChange={(e) =>
                    handleProductChange(index, "quantity", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-2">
                {index > 0 && (
                  <button
                    type="button"
                    className="btn btn-danger mt-4"
                    onClick={() => removeProductRow(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addProductRow}
          >
            Add Product
          </button>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Add Order
          </button>
        </div>
        <div>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
          {user && user.role === "admin" && (
            <button className="btn btn-warning" onClick={goToAdmin}>
              Go to Admin
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
export default Home;
