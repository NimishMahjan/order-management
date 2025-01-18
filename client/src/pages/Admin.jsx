import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { post } from "../Services/apiEndpoint.jsx";
import { Logout } from "../redux/authSlice.js";
import { useDispatch } from "react-redux";

function Admin() {
  const navigate = useNavigate();
  const SHEETBEST_URL =
    "https://api.sheetbest.com/sheets/8aa8106b-570a-465d-9c39-9f7fad53b1c0";
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();
  // Fetch Orders from the API
  const getOrders = async () => {
    try {
      const res = await fetch(SHEETBEST_URL);
      const data = await res.json();
      //console.log("Fetched Orders:", data); // Verify the API response
      setOrders(Object.keys(data).map((key) => data[key])); // Ensure data is an array
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]); // Set to an empty array on error
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    getOrders();
  }, []);

  const handleRegister = () => {
    navigate(`/admin/register`);
  };

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
  //Handle Adding Order
  const handleAdd = () => {
    navigate(`/user`);
  };
  // Handle Delete Order
  const handleDelete = async (orderNo) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!isConfirmed) {
      // If the user cancels, return without doing anything
      return;
    }

    try {
      // API call to delete order
      const res = await fetch(
        `https://api.sheetbest.com/sheets/8aa8106b-570a-465d-9c39-9f7fad53b1c0/${orderNo}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("Order deleted successfully!");
        const updatedData = orders.filter((_, i) => i !== orderNo);
        setOrders(updatedData);
      } else {
        console.error("Error deleting order:", await res.json());
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Order List</h2>
      <div className="d-flex align-items-center">
        <Button variant="primary" className="me-2" onClick={handleAdd}>
          Add New Order
        </Button>
        <Button variant="secondary" className="me-2" onClick={handleRegister}>
          Register User
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {Array.isArray(orders) && orders.length > 0 ? (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Order IN Time</th>
              <th>Order Received Date & Time</th>
              <th>Desired Delivery in Days</th>
              <th>Party Name</th>
              <th>Station</th>
              <th>Product Name</th>
              <th>Order Qty In NOS</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={i}>
                <td>{order["Order No"]}</td>
                <td>{order["Order IN Time"]}</td>
                <td>{order["Order Recived Date & Time"]}</td>
                <td>{order["Desired Delivery in Days"]}</td>
                <td>{order["Party Name"]}</td>
                <td>{order["Station"]}</td>
                <td>{order["Product Name"]}</td>
                <td>{order["Order Qty In NOS"]}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(i)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders available.</p>
      )}
    </div>
  );
}

export default Admin;
