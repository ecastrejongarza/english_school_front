import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext({
  user: null,
  handleLogin: (token) => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Intenta recuperar los datos del usuario del localStorage al cargar la página
    const storedUserData = localStorage.getItem("userId");
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }
  }, []);

  const handleLogin = (token) => {
    const decodedUser = jwtDecode(token);
    localStorage.setItem("userId", decodedUser.sub);
    localStorage.setItem("userRole", decodedUser.rol);
    localStorage.setItem("token", token);
    setUser(decodedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleExpiredToken = () => {
    // Limpiar el almacenamiento local y el estado de la aplicación
    localStorage.removeItem("token");
    // Otros pasos de limpieza, como restablecer el estado de la aplicación
    // o redirigir al usuario a la página de inicio de sesión
    window.location.href = "/login"; // Redirigir al usuario a la página de inicio de sesión
  };

  const getTokenExpiration = (token) => {
    try {
      // Decodificar el token JWT para obtener sus partes (cabecera, carga útil, firma)
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      // La carga útil del token JWT generalmente contiene un campo "exp" que representa la fecha de vencimiento en segundos desde el Unix Epoch
      const expiration = payload.exp * 1000; // Convertir a milisegundos

      return expiration;
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        handleLogin,
        handleLogout,
        handleExpiredToken,
        getTokenExpiration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
