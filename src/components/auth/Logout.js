import React, { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";

const Logout = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.handleLogout();
    navigate("/", { state: { message: " You have been logged out!" } });
  };

  return (
    <>
      <button className="dropdown-item" onClick={handleLogout}>
        <span className="text-secondary fw-bold"> Logout</span>
      </button>
    </>
  );
};

export default Logout;
