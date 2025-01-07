import { post } from "../Services/apiEndpoint";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function Login() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(username, password);
    try {
      const request = await post("/api/auth/login", { username, password });
      const response = request.data;

      if (request.status == 200) {
        if (response.user.role == "admin") {
          navigate("/admin");
        } else if (response.user.role == "user") {
          navigate("/user");
        }
        toast.success(response.message);
        dispatch(setUser(response.user));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="username"
              name=""
              id="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name=""
              id="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login </button>
        </form>
      </div>
    </>
  );
}

export default Login;
