import "./App.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Alumnos from "./components/alumnos/Alumnos";
import Comentarios from "./components/alumnos/Comentarios";
import Maestros from "./components/maestros/Maestros";
import LoginFirebase from "./components/auth/LoginFirebase";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "/node_modules/bootstrap/dist/js/bootstrap.min.js";
import AlumnosFirebase from "./components/alumnos/AlumnosFirebase";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginFirebase />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/admin/alumnos" element={<AlumnosFirebase />} />
            <Route path="/admin/comentarios/:id" element={<Comentarios />} />
            <Route path="/admin/maestros" element={<Maestros />} />
            <Route path="/master/alumnos" element={<Alumnos />} />
            <Route path="/master/comentarios/:id" element={<Comentarios />} />
          </Routes>
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;
