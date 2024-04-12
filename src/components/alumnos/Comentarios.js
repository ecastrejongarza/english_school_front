import { TextField, Modal, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext, useAuth } from "../auth/AuthProvider";

//estilo para modal
const useStyles = makeStyles((theme) => ({
  modal: {
    position: "absolute",
    width: 600,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  iconos: {
    cursor: "pointer",
  },
  inputMaterial: {
    width: "100%",
  },
}));

const AdminComentarios = () => {
  //Obtiene el Id desde App.js
  const params = useParams();

  console.log(params.id);
  const styles = useStyles();
  const [comentario, setComentarios] = useState();
  const [data, setData] = useState([]);
  const [modalInsertar, setModalInsertar] = useState(false);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState({
    username: params.id,
    comentario: "",
    idMaestro: localStorage.getItem("userId"),
  });
  const auth = useAuth();

  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
  };

  //Obtener comentarios por alumno
  const fetchApi = async () => {
    //validar token antes de hacer la consulta
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Verificar la expiración del token
    const tokenExpiration = auth.getTokenExpiration(token);
    if (tokenExpiration < Date.now()) {
      // El token ha expirado
      auth.handleExpiredToken();
      return;
    }
    try {
      const url = `http://localhost:8080/admin/comentarios/${params.id}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log(response.data);
      //const responseJSON = await response.json();
      setComentarios(response.data);
      console.log(comentario);
    } catch (error) {
      console.log(error);
    }
  };

  //asignar valor de cada campo para agregar el comentario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setComentarioSeleccionado((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //body para modal de insertar
  const bodyInsertar = (
    <div className={styles.modal}>
      <h3>Agregar nuevo comentario</h3>
      <TextField
        name="id"
        className={styles.inputMaterial}
        label="Id"
        disabled={true}
        value={params.id}
        onChange={handleChange}
      ></TextField>
      <br />
      <TextField
        name="comentario"
        className={styles.inputMaterial}
        label="Comentario"
        onChange={handleChange}
      />
      <br />
      <br />
      <br />
      <div align="right">
        <Button color="primary" onClick={() => peticionPost()}>
          Insertar
        </Button>
        <Button onClick={() => abrirCerrarModalInsertar()}>Cancelar</Button>
      </div>
    </div>
  );

  const peticionPost = async () => {
    //validar token antes de hacer la consulta
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Verificar la expiración del token
    const tokenExpiration = auth.getTokenExpiration(token);
    if (tokenExpiration < Date.now()) {
      // El token ha expirado
      auth.handleExpiredToken();
      return;
    }

    try {
      const url = `http://localhost:8080/admin/comentarios`;
      const result = await axios.post(url, comentarioSeleccionado, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      abrirCerrarModalInsertar();
      fetchApi();
    } catch (error) {
      console.log(error);
    }
  };

  //carga comentarios al cargar la pagina
  useEffect(() => {
    fetchApi();
  }, []);

  return (
    <div>
      <h1>Comentarios</h1>
      <Button onClick={() => abrirCerrarModalInsertar()}>
        Insertar comentario
      </Button>
      <div class="container" id="tabla">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>username</th>
              <th>Fecha del comentario</th>
              <th>Comentario</th>
              <th>Maestro</th>
            </tr>
          </thead>
          <tbody>
            {!comentario
              ? "Cargando..."
              : comentario.map((comentarios, i) => {
                  return (
                    <tr key={i}>
                      <td>{comentarios.username}</td>
                      <td>{comentarios.fecha}</td>
                      <td>{comentarios.comentario}</td>
                      <td>{comentarios.idMaestro}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      <Modal open={modalInsertar} onClose={() => abrirCerrarModalInsertar}>
        {bodyInsertar}
      </Modal>
    </div>
  );
};

export default AdminComentarios;
