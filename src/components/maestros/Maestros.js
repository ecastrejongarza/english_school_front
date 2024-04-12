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
    role: "1",
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
    console.log(name);
    console.log(value);
    setmaestroNuevo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  //mostrar maestros activos o inactivos
  const handleActiveInactive = async (e) => {
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
    const { name, value } = e.target;
    console.log(name);
    console.log(value);
    setValue(value);
    const rol = "1";
    try {
      const url = `http://localhost:8080/admin/${rol}/${value}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log(response);
      setMaestros(response.data);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(`Error fetching data : ${error.message}`);
      console.error("Error fetching data:", error);
    }
  };

  //Obtener maestros
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
      const rol = "MASTER";
      const url = `http://localhost:8080/admin/all/${rol}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      //const responseJSON = await response;
      setMaestros(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
      const url = `http://localhost:8080/registrar`;
      const result = await axios.post(url, maestroNuevo, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      fetchApi();
      // Close the modal
      setModalInsertar(false);
    } catch (error) {
      console.log(error);
    }
  };

  //carga comentarios al cargar la pagina
  useEffect(() => {
    fetchApi();
  }, []);

  // Función para manejar el cambio de estado del checkbox de un maestro
  const handleCheckboxChange = async (id, checked) => {
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

    setActivo(checked ? 1 : 0);

    const url = `http://localhost:8080/admin/${id}`;
    // Realizar la solicitud de actualización al backend
    const requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        activo: checked ? 1 : 0,
      }),
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      //fetchApi();
    } catch (error) {
      console.log("Error al enviar la actualización al backend:", error);
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
    if (user) {
      setUserRole(localStorage.getItem("userRole"));
    } else {
      setUserRole("");
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
      <div class="container" id="tabla">
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
