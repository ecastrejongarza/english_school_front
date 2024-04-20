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
import {
  doCreateUserWithEmailAndPassword,
  getAllAlumnsADMIN,
} from "../utils/Apifunctions";
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

const AlumnosFirebase = () => {
  //estado para abrir/cerrar modal
  const [modalInsertar, setModalInsertar] = useState(false);
  const [alumno, setAlumnos] = useState();
  const styles = useStyles();
  const [data, setData] = useState([]);
  const [alumnoNuevo, setAlumnoNuevo] = useState({
    nombre: "",
    paterno: "",
    materno: "",
    telefono: "",
    email: "",
    role: "ALUMN",
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
  const [isRegistrando, setIsRegistrando] = useState(false);
  const [valor, setValor] = useState("");

  const abrirCerrarModalInsertar = () => {
    setModalInsertar(!modalInsertar);
  };

  //asignar valor de cada campo para agregar el comentario
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);
    setAlumnoNuevo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //mostrar alumnos activos o inactivos
  const handleActiveInactive = async (e) => {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);
    setValue(value);
    //cambiar value a string
    if (value === 1) {
      setValor("1");
    } else {
      setValor("0");
    }
    try {
      const db = getFirestore(app);
      // Establece una referencia a la colección que deseas consultar
      const registrosRef = collection(db, "usuarios");

      // Construir una consulta que filtre los registros en función de un campo específico
      const filtroQuery = query(
        registrosRef,
        where("role", "==", "ALUMN"),
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
      setAlumnos(listaRegistros);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(`Error fetching data : ${error.message}`);
      console.error("Error fetching data:", error);
    }
  };

  //Obtener alumnos
  const fetchApi = async () => {
    try {
      const db = getFirestore(app);
      // Establece una referencia a la colección que deseas consultar
      const registrosRef = collection(db, "usuarios");

      // Construir una consulta que filtre los registros en función de un campo específico
      const filtroQuery = query(
        registrosRef,
        where("role", "==", "ALUMN"),
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
      setAlumnos(listaRegistros);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const peticionPost = async () => {
    //e.preventDefault();
    try {
      const firestore = getFirestore(app);
      const db = getFirestore(app);
      // Obtener la colección de alumnos
      const alumnosRef = collection(db, "usuarios");

      let ultimoAlumno;
      const filtro = query(
        alumnosRef,
        where("role", "==", "ALUMN"),
        orderBy("username", "desc"),
        limit(1)
      );

      const ultimoAlumnoQuery = await getDocs(filtro);
      console.log(ultimoAlumnoQuery.docs);
      if (ultimoAlumnoQuery.docs.length > 0) {
        const ultimoAlumnoData = ultimoAlumnoQuery.docs[0].data();
        console.log(ultimoAlumnoQuery.docs[0].data());
        console.log("Datos del último alumno:", ultimoAlumnoData);
        // Asignar el valor a ultimoAlumno
        ultimoAlumno = ultimoAlumnoData;
        // Resto del código para manejar el último alumno
      } else {
        console.log("No se encontraron documentos");
        // Si no hay documentos, podrías asignar un valor predeterminado a ultimoAlumno
        ultimoAlumno = null; // o cualquier otro valor predeterminado que desees
      }

      // Ahora puedes acceder a las propiedades de ultimoAlumno de forma segura
      const ultimoUsername = ultimoAlumno ? ultimoAlumno.username : null;

      // Generar el nuevo username incrementando el último en 1
      const nuevoUsername =
        "A" +
        (parseInt(ultimoUsername.substring(1)) + 1).toString().padStart(3, "0");

      // Suponiendo que Timestamp es la clase de fecha y hora de Firestore
      const timestamp = Timestamp.now(); // Obtener una instancia de Timestamp
      const date = timestamp.toDate(); // Convertir el Timestamp a un objeto Date

      // Ahora puedes formatear la fecha utilizando la biblioteca que estés utilizando, como date-fns
      const formattedDate = format(date, "dd/MM/yy");

      const infoUsuario = await createUserWithEmailAndPassword(
        firebase,
        alumnoNuevo.email,
        alumnoNuevo.password
      );
      console.log("entra2");
      console.log(infoUsuario.user.uid);
      const docuRef = doc(firestore, `usuarios/${infoUsuario.user.uid}`);
      await setDoc(docuRef, {
        email: alumnoNuevo.email,
        role: alumnoNuevo.role,
        nombre: alumnoNuevo.nombre,
        paterno: alumnoNuevo.paterno,
        materno: alumnoNuevo.materno,
        telefono: alumnoNuevo.telefono,
        password: alumnoNuevo.password,
        username: nuevoUsername,
        fecha_inscripcion: formattedDate,
        activo: "1",
      });

      fetchApi();
      // Cerrar el modal
      setModalInsertar(false);
    } catch (error) {
      console.log(error);
      // Mostrar mensaje de error de reCAPTCHA si es necesario
      setErrorMessage(
        "Por favor, complete la verificación de reCAPTCHA antes de enviar el formulario."
      );
    }
  };

  //carga comentarios al cargar la pagina
  useEffect(() => {
    fetchApi();
  }, []);

  // Función para manejar el cambio de estado del checkbox de un alumno
  const handleCheckboxChange = async (id, checked) => {
    setActivo(checked ? 1 : 0);
    console.log(typeof activo);

    const url = `http://localhost:8080/admin/${id}`;

    try {
      const db = getFirestore(app);
      // Obtener la colección de alumnos
      const alumnosRef = doc(db, "usuarios", id);

      let active;
      if (activo === 1) {
        active = "1";
      } else {
        active = "0";
      }
      const actualizaEstado = await updateDoc(alumnosRef, {
        activo: active,
      });
      console.log(actualizaEstado);
    } catch (error) {
      console.log("Error al enviar la actualización al backend:", error);
    }
    console.log(id + " " + checked);
    setAlumnos(
      alumno.map((alumno) =>
        alumno.id === id
          ? {
              ...alumno,
              activo: alumno.activo === 1 ? 0 : 1, // Cambiar el valor de "activo" (1 -> 0, 0 -> 1)
            }
          : alumno
      )
    );
  };

  //cargar rol de usuario
  useEffect(() => {
    if (user) {
      setUserRole(localStorage.getItem("userRole"));
    } else {
      setUserRole("");
    }
  }, [user]);

  //body para modal de insertar alumnos
  const bodyInsertar = (
    <div className={styles.modal}>
      <h3>Agregar nuevo alumno</h3>
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
      {/*<RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
        >
          <FormControlLabel
            name="role"
            value="3"
            control={<Radio />}
            label="Admin"
            onChange={handleChange}
          />
          <FormControlLabel
            name="role"
            value="1"
            control={<Radio />}
            label="Maestro"
            onChange={handleChange}
          />
          <FormControlLabel
            name="role"
            value="2"
            control={<Radio />}
            label="Alumno"
            onChange={handleChange}
          />
    </RadioGroup>*/}
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
      <h1>Alumnos</h1>
      <Grid container rowspacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          {userRole === "ADMIN" && ( // Mostrar botón solo si el usuario es ADMIN
            <Button
              variant="outlined"
              onClick={() => abrirCerrarModalInsertar()}
            >
              NUEVO ALUMNO
            </Button>
          )}
        </Grid>
        <Grid item xs={6}>
          {userRole === "ADMIN" && (
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">
                Alumnos activos
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
              <th>Fecha de inscripción</th>
              {userRole === "ADMIN" && <th>Activo</th>}
            </tr>
          </thead>
          <tbody class="table-group-divider">
            {!alumno
              ? "Cargando..."
              : alumno.map((alumnos, i) => {
                  return (
                    <tr key={i}>
                      {userRole === "ADMIN" && (
                        <td>
                          <NavLink
                            to={"/admin/comentarios/" + alumnos.username}
                          >
                            {alumnos.username}
                          </NavLink>
                        </td>
                      )}
                      {userRole === "MASTER" && (
                        <td>
                          <NavLink
                            to={"/master/comentarios/" + alumnos.username}
                          >
                            {alumnos.username}
                          </NavLink>
                        </td>
                      )}
                      <td>{alumnos.nombre}</td>
                      <td>{alumnos.paterno}</td>
                      <td>{alumnos.materno}</td>
                      <td>{alumnos.telefono}</td>
                      <td>{alumnos.email}</td>
                      <td>{alumnos.fechaInscripcion}</td>
                      {userRole === "ADMIN" && (
                        <td>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={alumnos.activo === 1}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    alumnos.id,
                                    e.target.checked
                                  )
                                }
                                name={`isChecked-${alumnos.id}`}
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

export default AlumnosFirebase;
