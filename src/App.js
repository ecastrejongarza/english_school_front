import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { AuthProvider } from "./components/auth/AuthProvider";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Navbar from "./components/layout/Navbar";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Alumnos from "./components/alumnos/Alumnos";
import Comentarios from "./components/alumnos/Comentarios";
import Maestros from "./components/maestros/Maestros";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/admin/alumnos" element={<Alumnos />} />
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
