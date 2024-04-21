import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { doc, getDoc, getFirestore } from "@firebase/firestore";
import { app } from "../../firebase/firebase";
import { getInfo } from "../utils/Apifunctions";

const firestore = getFirestore(app);

export const AuthContext = createContext({
  user: null,
  handleLogin: (uid) => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Intenta recuperar los datos del usuario del localStorage al cargar la página
    const storedUserData = localStorage.getItem("uid");

    if (storedUserData) {
      setUser(storedUserData);
    }
  }, []);

  /*const handleLogin = (token) => {
    const decodedUser = jwtDecode(token);
    localStorage.setItem("userId", decodedUser.sub);
    localStorage.setItem("userRole", decodedUser.rol);
    localStorage.setItem("token", token);
    setUser(decodedUser);
  };*/

  //llenar localStorage con la info del usuario
  const handleLogin = async (uid) => {
    // Obtener información adicional del usuario
    const userInfo = await getInfo(uid);

    // Actualizar el estado del usuario con el ID de usuario
    setUser(uid);

    if (userInfo) {
      // Almacenar información adicional del usuario en el almacenamiento local
      console.log("userInfo "+ userInfo)
      localStorage.setItem("uid", uid);
      localStorage.setItem("role", userInfo.role);
      localStorage.setItem("nombre", userInfo.nombre);
    } else {
      // Manejar el caso en que no se pueda obtener la información del usuario
      console.error("Unable to fetch user info");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rol");
    localStorage.removeItem("nombre");
    localStorage.removeItem("uid");
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
