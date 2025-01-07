import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function PublicLayout() {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else navigate("/user");
    }
  }, [user, navigate]);
  return (
    <>
      <Outlet />
    </>
  );
}

export default PublicLayout;
