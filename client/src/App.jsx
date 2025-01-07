import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Edit from "./pages/Edit";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import PublicLayout from "./layouts/PublicLayout";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="register" element={<Register />} />
            <Route path="edit/:rowIndex" element={<Edit />} />
          </Route>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/login" element={<PublicLayout />}>
            <Route index element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
