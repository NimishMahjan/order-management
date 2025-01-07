import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function AdminLayout() {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  //console.log(user);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);
  return (
    <>
      <Outlet />
    </>
  );
}

export default AdminLayout;
