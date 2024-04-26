import {
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  Modal,
  TextField,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
  Grid,
} from "@material-ui/core";
import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { getAllAlumnsADMIN } from "../utils/Apifunctions";
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

const Maestros = () => {
  //estado para abrir/cerrar modal
  const [modalInsertar, setModalInsertar] = useState(false);
  const [maestro, setMaestros] = useState();
  const styles = useStyles();
  const [data, setData] = useState([]);
  const [maestroNuevo, setmaestroNuevo] = useState({
    nombre: "",
    paterno: "",
    materno: "",
    telefono: "",
    email: "",
    role: "MASTER",
    password: "",
  });
  const [activo, setActivo] = useState({
    activo: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [value, setValue] = useState("1");
  const auth = useAuth();
  const [userRole, setUserRole] = useState("");
  const { user } = useContext(AuthContext);

  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
  };

  //asignar valor de cada campo para agregar el comentario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setmaestroNuevo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //mostrar maestros activos o inactivos
  const handleActiveInactive = async (e) => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      const { name, value } = e.target;

      setValue(value);
      const rol = "1";
      try {
        const db = getFirestore(app);
        // Establece una referencia a la colección que deseas consultar
        const registrosRef = collection(db, "usuarios");

        // Construir una consulta que filtre los registros en función de un campo específico
        const filtroQuery = query(
          registrosRef,
          where("role", "==", "MASTER"),
          where("activo", "==", value),
          orderBy("username", "asc")
        );

        // Ejecuta la consulta para obtener todos los documentos de esa colección
        const querySnapshot = await getDocs(filtroQuery);
        // Procesa los resultados de la consulta y almacénalos en el estado
        const listaRegistros = [];
        querySnapshot.forEach((doc) => {
          // Agrega el ID del documento a los datos
          listaRegistros.push({ id: doc.id, ...doc.data() });
        });
        setMaestros(listaRegistros);
      } catch (error) {
        setSuccessMessage("");
        setErrorMessage(`Error fetching data : ${error.message}`);
        console.error("Error fetching data:", error);
      }
    }
  };

  //Obtener maestros
  const fetchApi = async () => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      try {
        const db = getFirestore(app);
        // Establece una referencia a la colección que deseas consultar
        const registrosRef = collection(db, "usuarios");

        // Construir una consulta que filtre los registros en función de un campo específico
        const filtroQuery = query(
          registrosRef,
          where("role", "==", "MASTER"),
          where("activo", "==", "1"),
          orderBy("username", "asc")
        );

        // Ejecuta la consulta para obtener todos los documentos de esa colección
        const querySnapshot = await getDocs(filtroQuery);
        // Procesa los resultados de la consulta y almacénalos en el estado
        const listaRegistros = [];
        querySnapshot.forEach((doc) => {
          // Agrega el ID del documento a los datos
          listaRegistros.push({ id: doc.id, ...doc.data() });
        });
        setMaestros(listaRegistros);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const peticionPost = async () => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      try {
        const firestore = getFirestore(app);
        const db = getFirestore(app);
        // Obtener la colección de alumnos
        const maestrosRef = collection(db, "usuarios");

        let ultimoMaestro;
        const filtro = query(
          maestrosRef,
          where("role", "==", "MASTER"),
          orderBy("username", "desc"),
          limit(1)
        );

        const ultimoMaestroQuery = await getDocs(filtro);
        if (ultimoMaestroQuery.docs.length > 0) {
          const ultimoMaestroData = ultimoMaestroQuery.docs[0].data();
          // Asignar el valor a ultimoMaestro
          ultimoMaestro = ultimoMaestroData;
          // Resto del código para manejar el último alumno
        } else {
          console.log("No se encontraron documentos");
          // Si no hay documentos, podrías asignar un valor predeterminado a ultimoMaestro
          ultimoMaestro = null; // o cualquier otro valor predeterminado que desees
        }

        // Ahora puedes acceder a las propiedades de ultimoMaestro de forma segura
        const ultimoUsername = ultimoMaestro ? ultimoMaestro.username : null;

        let nuevoUsername;
        // Generar el nuevo username incrementando el último en 1
        if (ultimoUsername === null) {
          nuevoUsername = "M001";
        } else {
          nuevoUsername =
            "M" +
            (parseInt(ultimoUsername.substring(1)) + 1)
              .toString()
              .padStart(3, "0");
        }
        // Suponiendo que Timestamp es la clase de fecha y hora de Firestore
        const timestamp = Timestamp.now(); // Obtener una instancia de Timestamp
        const date = timestamp.toDate(); // Convertir el Timestamp a un objeto Date

        // Ahora puedes formatear la fecha utilizando la biblioteca que estés utilizando, como date-fns
        const formattedDate = format(date, "dd/MM/yy");

        const infoUsuario = await createUserWithEmailAndPassword(
          firebase,
          maestroNuevo.email,
          maestroNuevo.password
        );
        const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
        await setDoc(docuRef, {
          email: maestroNuevo.email,
          role: maestroNuevo.role,
          nombre: maestroNuevo.nombre,
          paterno: maestroNuevo.paterno,
          materno: maestroNuevo.materno,
          telefono: maestroNuevo.telefono,
          password: maestroNuevo.password,
          username: nuevoUsername,
          fecha_inscripcion: formattedDate,
          activo: "1",
        });
        fetchApi();
        // Close the modal
        setModalInsertar(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  //carga comentarios al cargar la pagina
  useEffect(() => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      fetchApi();
    }
  }, []);

  // Función para manejar el cambio de estado del checkbox de un maestro
  const handleCheckboxChange = async (id, checked) => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      setActivo(checked ? 1 : 0);

      try {
        const db = getFirestore(app);
        // Obtener la colección de alumnos
        const maestrosRef = doc(db, "usuarios", id);

        const active = value === "1" ? { activo: "0" } : { activo: "1" };
        console.log(value);
        console.log(typeof value);
        console.log(active);
        const actualizaEstado = await updateDoc(maestrosRef, active);
        console.log(actualizaEstado);
      } catch (error) {
        console.log("Error al enviar la actualización al backend:", error);
      }
    }
    console.log(id + " " + checked);
    setMaestros(
      maestro.map((maestro) =>
        maestro.id === id
          ? {
              ...maestro,
              activo: maestro.activo === 1 ? 0 : 1, // Cambiar el valor de "activo" (1 -> 0, 0 -> 1)
            }
          : maestro
      )
    );
  };

  //cargar rol de usuario
  useEffect(() => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      if (user) {
        setUserRole(localStorage.getItem("role"));
      } else {
        setUserRole("");
      }
    }
  }, [user]);

  //body para modal de insertar maestros
  const bodyInsertar = (
    <div className={styles.modal}>
      <h3>Agregar nuevo maestro</h3>
      <TextField
        name="nombre"
        className={styles.inputMaterial}
        label="Nombre"
        onChange={handleChange}
      ></TextField>
      <br />
      <TextField
        name="paterno"
        className={styles.inputMaterial}
        label="Apellido paterno"
        onChange={handleChange}
      />
      <TextField
        name="materno"
        className={styles.inputMaterial}
        label="Apellido materno"
        onChange={handleChange}
      />
      <TextField
        name="telefono"
        className={styles.inputMaterial}
        label="Teléfono"
        onChange={handleChange}
      />
      <TextField
        name="email"
        className={styles.inputMaterial}
        label="Email"
        onChange={handleChange}
      />
      <TextField
        name="password"
        className={styles.inputMaterial}
        label="Password"
        onChange={handleChange}
      />
      <div align="right">
        <Button color="primary" onClick={() => peticionPost()}>
          Insertar
        </Button>
        <Button onClick={() => abrirCerrarModalInsertar()}>Cancelar</Button>
      </div>
    </div>
  );

  return (
    <div>
      <h1>Maestros</h1>
      <Grid container rowspacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          {userRole === "ADMIN" && ( // Mostrar botón solo si el usuario es ADMIN
            <Button
              variant="outlined"
              onClick={() => abrirCerrarModalInsertar()}
            >
              NUEVO MAESTRO
            </Button>
          )}
        </Grid>
        <Grid item xs={6}>
          {userRole === "ADMIN" && (
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">
                Maestros activos
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={value}
                onChange={handleActiveInactive}
              >
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label="Activos"
                />
                <FormControlLabel
                  value="0"
                  control={<Radio />}
                  label="Inactivos"
                />
              </RadioGroup>
            </FormControl>
          )}
        </Grid>
      </Grid>
      {errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
      {successMessage && (
        <p className="alert alert-success">{successMessage}</p>
      )}
      <div className="container" id="tabla">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Matrícula</th>
              <th>Nombre</th>
              <th>Apellido paterno</th>
              <th>Apellido materno</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Fecha de alta</th>
              {userRole === "ADMIN" && <th>Activo</th>}
            </tr>
          </thead>
          <tbody class="table-group-divider">
            {!maestro
              ? "Cargando..."
              : maestro.map((maestros, i) => {
                  return (
                    <tr key={i}>
                      <td>{maestros.username}</td>
                      <td>{maestros.nombre}</td>
                      <td>{maestros.paterno}</td>
                      <td>{maestros.materno}</td>
                      <td>{maestros.telefono}</td>
                      <td>{maestros.email}</td>
                      <td>{maestros.fechaInscripcion}</td>
                      {userRole === "ADMIN" && (
                        <td>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={maestros.activo === 1}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    maestros.id,
                                    e.target.checked
                                  )
                                }
                                name={`isChecked-${maestros.id}`}
                                color="primary"
                              />
                            }
                          />
                        </td>
                      )}
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

export default Maestros;
