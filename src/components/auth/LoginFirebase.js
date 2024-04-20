import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { app } from "../../firebase/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "./AuthProvider";

function LoginFirebase() {
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const redirectUrl = location.state?.path || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app);
  const navigate = useNavigate();
  const authProvider = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // El inicio de sesión fue exitoso, puedes hacer algo con userCredential.user
      console.log(userCredential.user.uid);
      authProvider.handleLogin(userCredential.user.uid);
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      // El inicio de sesión falló, maneja el error
      console.error("Error al iniciar sesión:", error);
      setErrorMessage("Invalid username or password. Please try again.");
    }
    // Limpia el mensaje de error después de 4 segundos
    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  };

  return (
    <section className="container col-6 mt-5 mb-5">
      {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <label htmlFor="email" className="col-sm-2 col-form-label">
            Email
          </label>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <label htmlFor="password" className="col-sm-2 col-form-label">
            Password
          </label>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <button
            type="submit"
            className="btn btn-hotel"
            style={{ marginRight: "10px" }}
          >
            Login
          </button>
          <span style={{ marginLeft: "10px" }}>
            Don't have an account yet?<Link to={"/register"}> Register</Link>
          </span>
        </div>
      </form>
    </section>
  );
}

export default LoginFirebase;
