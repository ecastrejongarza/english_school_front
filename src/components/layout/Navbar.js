import React, { useState, useEffect, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import Logout from "../auth/Logout";
import logo from "../logo/logo.png";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showAccount, setShowAccount] = useState(false);

  const { user } = useContext(AuthContext);

  const handleAccountClick = () => {
    setShowAccount(!showAccount);
  };

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      setUserRole(localStorage.getItem("rol"));
    } else {
      setIsLoggedIn(false);
      setUserRole("");
    }
  }, [user]);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary px-5 shadow mt-5 sticky-top">
      <div className="container-fluid">
        <Link to={"/"} className="navbar-brand">
          <img
            src={logo}
            alt="logo"
            style={{ width: "40px", height: "40px", marginRight: "10px" }}
          />
          <span className="text-secondary fw-bold">English CM</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarScroll"
          aria-controls="navbarScroll"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarScroll">
          <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
            {isLoggedIn && userRole === "ADMIN" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to={"/admin/alumnos"}
                >
                  <span className="text-secondary fw-bold">Alumnos</span>
                </NavLink>
              </li>
            )}
            {isLoggedIn && userRole === "MASTER" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to={"/master/alumnos"}
                >
                  <span className="text-secondary fw-bold">Alumnos</span>
                </NavLink>
              </li>
            )}
            {isLoggedIn && userRole === "ADMIN" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to={"/admin/maestros"}
                >
                  <span className="text-secondary fw-bold">Maestros</span>
                </NavLink>
              </li>
            )}
            {isLoggedIn && userRole === "ADMIN" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to={"/admin/horarios"}
                >
                  <span className="text-secondary fw-bold">Horarios</span>
                </NavLink>
              </li>
            )}
            {isLoggedIn && userRole === "ALUMN" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to={"/alumn/horarios"}
                >
                  <span className="text-secondary fw-bold">Horarios</span>
                </NavLink>
              </li>
            )}
            {isLoggedIn && userRole === "MASTER" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to={"/master/horarios"}
                >
                  <span className="text-secondary fw-bold">Horarios</span>
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="d-flex navbar-nav">
            {isLoggedIn ? (
              <Logout />
            ) : (
              <li>
                <Link className="dropdown-item" to={"/login"}>
                  <span className="text-secondary fw-bold">Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
