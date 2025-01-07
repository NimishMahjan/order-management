import React, { useState } from "react";
import { post } from "../Services/apiEndpoint";
import { toast } from "react-hot-toast";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(username, password);
    try {
      const request = await post("/api/auth/register", { username, password });
      const response = request.data;
      if (request.status == 200) {
        toast.success(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div className="register-container">
        <h2>Register</h2>
        <form action="" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name=""
              onChange={(e) => setUsername(e.target.value)}
              id="username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name=""
              onChange={(e) => setPassword(e.target.value)}
              id="password"
            />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </>
  );
}

export default Register;
