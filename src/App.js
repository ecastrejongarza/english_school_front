import "./App.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import Navbar from "./components/layout/Navbar";
import Logout from "./components/auth/Logout";
import ComentariosFirebase from "./components/alumnos/ComentariosFirebase";
import MaestrosFirebase from "./components/maestros/MaestrosFirebase";
import LoginFirebase from "./components/auth/LoginFirebase";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "/node_modules/bootstrap/dist/js/bootstrap.min.js";
import AlumnosFirebase from "./components/alumnos/AlumnosFirebase";
import Horarios from "./components/horarios/Horarios";

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
            <Route
              path="/admin/comentarios/:id"
              element={<ComentariosFirebase />}
            />
            <Route path="/admin/maestros" element={<MaestrosFirebase />} />
            <Route path="/master/alumnos" element={<AlumnosFirebase />} />
            <Route
              path="/master/comentarios/:id"
              element={<ComentariosFirebase />}
            />
            <Route path="/admin/horarios" element={<Horarios />} />
          </Routes>
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;
