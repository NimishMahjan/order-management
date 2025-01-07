import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Edit() {
  const { rowIndex } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState({
    "Order No": "",
    "Order IN Time": "",
    "Order Received Date & Time": "",
    "Desired Delivery in Days": "",
    "Party Name": "",
    Station: "",
    "Product Name": "",
    "Order Qty In NOS": "",
  });

  const getOrders = async () => {
    try {
      const res = await fetch(
        `https://api.sheetbest.com/sheets/8aa8106b-570a-465d-9c39-9f7fad53b1c0/${rowIndex}`
      );
      const data = await res.json();
      setOrders(data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleChange = (e) => {
    setOrders({ ...orders, [e.target.name]: e.target.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const filteredOrders = {
        "Order No": orders["Order No"],
        "Order IN Time": orders["Order IN Time"],
        "Order Received Date & Time": orders["Order Received Date & Time"],
        "Desired Delivery in Days": orders["Desired Delivery in Days"],
        "Party Name": orders["Party Name"],
        Station: orders["Station"],
        "Product Name": orders["Product Name"],
        "Order Qty In NOS": orders["Order Qty In NOS"],
      };

      const res = await fetch(
        `https://api.sheetbest.com/sheets/8aa8106b-570a-465d-9c39-9f7fad53b1c0/${rowIndex}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredOrders),
        }
      );

      if (res.ok) {
        console.log("Order edited successfully");
        alert("Order edited successfully!");
        navigate("/admin");
      }
    } catch (err) {
      console.error("Error while editing order:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };
  const handleCancel = () => {
    navigate("/admin");
  };
  const allowedFields = [
    "Order No",
    "Order IN Time",
    "Order Received Date & Time",
    "Desired Delivery in Days",
    "Party Name",
    "Station",
    "Product Name",
    "Order Qty In NOS",
  ];

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Edit Order</h1>
      <form onSubmit={handleSubmit} className="row g-3">
        {allowedFields.map((field, index) => (
          <div className="col-md-6" key={index}>
            <label htmlFor={field} className="form-label">
              {field.replace(/_/g, " ")}
            </label>
            <input
              type={
                field.includes("Time")
                  ? "datetime-local"
                  : field.includes("Qty") || field.includes("Days")
                  ? "number"
                  : "text"
              }
              id={field}
              name={field}
              className="form-control"
              placeholder={field.replace(/_/g, " ")}
              value={orders[field] || ""}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <div className="col-12">
          <button className="btn btn-primary" type="submit">
            Save Changes
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Edit;
