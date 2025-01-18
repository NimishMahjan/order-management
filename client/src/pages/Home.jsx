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
  const SHEETBEST_URL =
    "https://api.sheetbest.com/sheets/8aa8106b-570a-465d-9c39-9f7fad53b1c0";

  const [orders, setOrders] = useState({
    "Order No": "",
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
  const [lastOrderNumber, setLastOrderNumber] = useState("tk000");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch CSV data for stations, products, and parties
        const stationsData = await readCSV("/data/stations.csv");
        const productsData = await readCSV("/data/products.csv");
        const partiesData = await readCSV("/data/parties.csv");

        setStations(stationsData.map((row) => row.name));
        setProducts(productsData.map((row) => row.name));
        setParties(partiesData.map((row) => row.name));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const request = await post("/api/auth/logout");
      if (request.status === 200) {
        dispatch(Logout());
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
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

  const goToAdmin = () => {
    navigate("/admin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Fetch the latest order data
      const res = await fetch(SHEETBEST_URL);
      const data = await res.json();

      // Determine the next order number
      let nextOrderNumber = "tk001"; // Default starting order number
      if (Array.isArray(data) && data.length > 0) {
        const existingOrderNumbers = data
          .map((row) => row["Order No"])
          .filter(
            (orderNo) => typeof orderNo === "string" && orderNo.startsWith("tk")
          )
          .map((orderNo) => parseInt(orderNo.slice(2)))
          .filter((num) => !isNaN(num));

        if (existingOrderNumbers.length > 0) {
          const maxOrderNumber = Math.max(...existingOrderNumbers);
          nextOrderNumber = `tk${(maxOrderNumber + 1)
            .toString()
            .padStart(3, "0")}`;
        }
      }

      const currentDateTime = new Date().toISOString();

      // Prepare the order data
      const updatedOrders = {
        ...orders,
        "Order No": nextOrderNumber,
        "Order Recived Date & Time": currentDateTime,
      };

      // Add the order to the sheet
      const rowsToInsert = orderProducts.map((product) => ({
        ...updatedOrders,
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
          alert(`Error adding order: ${errorData.detail || "Unknown error"}`);
          return;
        }
      }

      alert("Order added successfully!");

      // Update the last order number
      setLastOrderNumber(nextOrderNumber);

      // Reset the form and state
      setOrders({
        "Order No": "",
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
        {/* Order Form */}
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
              <div className="col-md-5">
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

              <div className="col-md-3 d-flex align-items-end justify-content-start">
                {index > 0 && (
                  <button
                    type="button"
                    className="btn btn-danger me-2"
                    onClick={() => removeProductRow(index)}
                  >
                    -
                  </button>
                )}
                {index === orderProducts.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addProductRow}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Save Order
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
