import { TextField, Modal, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext, useAuth } from "../auth/AuthProvider";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  doc,
  setDoc,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { app } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { format } from "date-fns";
const firebase = getAuth(app);

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
    idMaestro: localStorage.getItem("id"),
  });
  const auth = useAuth();

  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
  };

  //Obtener comentarios por alumno
  const fetchApi = async () => {
    try {
      const db = getFirestore(app);
      // Establece una referencia a la colección que deseas consultar
      const registrosRef = collection(db, "comentarios");

      // Construir una consulta que filtre los registros en función de un campo específico
      const filtroQuery = query(
        registrosRef,
        where("idAlumno", "==", params.id),
        orderBy("fecha", "asc")
      );

      // Ejecuta la consulta para obtener todos los documentos de esa colección
      const querySnapshot = await getDocs(filtroQuery);
      // Procesa los resultados de la consulta y almacénalos en el estado
      const listaRegistros = [];
      querySnapshot.forEach((doc) => {
        // Agrega el ID del documento a los datos
        listaRegistros.push({ id: doc.id, ...doc.data() });
      });
      //const responseJSON = await response.json();
      setComentarios(listaRegistros);
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
    try {
      const firestore = getFirestore(app);
      const db = getFirestore(app);
      // Obtener la colección de alumnos
      const alumnosRef = collection(db, "comentarios");
      // Suponiendo que Timestamp es la clase de fecha y hora de Firestore
      const timestamp = Timestamp.now(); // Obtener una instancia de Timestamp
      const date = timestamp.toDate(); // Convertir el Timestamp a un objeto Date

      // Ahora puedes formatear la fecha utilizando la biblioteca que estés utilizando, como date-fns
      const formattedDate = format(date, "dd/MM/yy");

      const docuRef = collection(firestore, `comentarios`);
      await addDoc(docuRef, {
        fecha: formattedDate,
        comentario: comentarioSeleccionado.comentario,
        idMaestro: localStorage.getItem("uid"),
        idAlumno: params.id,
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
      <Button variant="outlined" onClick={() => abrirCerrarModalInsertar()}>
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
                      <td>{comentarios.idAlumno}</td>
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
