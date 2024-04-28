import React, { useEffect, useState } from "react";
import { Calendar, dayjsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import {
  Container,
  Grid,
  TextField,
  makeStyles,
  Modal,
  Button,
  Typography,
} from "@material-ui/core";
import { Autocomplete } from "@mui/material";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
} from "@firebase/firestore";
import { app } from "../../firebase/firebase";
import { format } from "date-fns";
import moment from "moment";

const Horarios = () => {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 2,
      paddingTop: theme.spacing(5),
    },
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modalContent: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));
  const classes = useStyles();
  const localizer = dayjsLocalizer(dayjs);
  const [selectedDate, setSelectedDate] = useState(null);
  const [alumnosMap, setAlumnosMap] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [maestrosMap, setMaestrosMap] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHora, setSelectedHora] = useState(null);
  const [selectedMaestro, setSelectedMaestro] = useState(null);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedHoraFin, setSelectedHorafin] = useState(null);

  const horas = [
    { label: "11:00 - 11:50", id: "1" },
    { label: "12:00 - 12:50", id: "2" },
    { label: "13:00 - 13:50", id: "3" },
    { label: "15:00 - 15:50", id: "4" },
    { label: "16:00 - 16:50", id: "5" },
    { label: "17:00 - 17:50", id: "6" },
    { label: "18:00 - 18:50", id: "7" },
  ];

  const handleSelectSlot = ({ start, end }) => {
    console.log(start + " " + end);
    setSelectedDate(start);
    setSelectedHorafin(end);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  //obtener usuarios
  const fetchApi = async () => {
    //validar uid antes de hacer la consulta
    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      const rol = localStorage.getItem("role");
      console.log(rol);
      if (rol === "ADMIN") {
        try {
          //////////consultar alumnos
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
          setAlumnosMap(
            listaRegistros.map((alumno) => ({
              label: alumno.nombre,
              id: alumno.id,
              username: alumno.username,
            }))
          );
          //////consultar maestros
          // Construir una consulta que filtre los registros en función de un campo específico
          const filtroQueryMaestros = query(
            registrosRef,
            where("role", "==", "MASTER"),
            where("activo", "==", "1"),
            orderBy("username", "asc")
          );

          // Ejecuta la consulta para obtener todos los documentos de esa colección
          const querySnapshotMaestros = await getDocs(filtroQueryMaestros);
          // Procesa los resultados de la consulta y almacénalos en el estado
          const listaRegistrosMaestros = [];
          querySnapshotMaestros.forEach((doc) => {
            // Agrega el ID del documento a los datos
            listaRegistrosMaestros.push({ id: doc.id, ...doc.data() });
          });
          setMaestros(listaRegistrosMaestros);
          setMaestrosMap(
            listaRegistrosMaestros.map((maestro) => ({
              label: maestro.nombre,
              id: maestro.id,
              username: maestro.username,
            }))
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else if (rol === "ALUMN") {
        setAlumnosMap(localStorage.getItem("nombre"));
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
      // Realizar la consulta a Firestore aquí
      const fetchEvents = async () => {
        try {
          const db = getFirestore(app);
          const eventosRef = collection(db, "horarios");
          const q = query(eventosRef, where("dia", "==", selectedDate));
          const querySnapshot = await getDocs(q);

          const eventos = [];
          querySnapshot.forEach((doc) => {
            eventos.push({
              title: doc.data().titulo,
              start: doc.data().diaInicio.toDate(),
              end: doc.data().diaFin.toDate(), // Aquí podrías modificar el valor si necesitas un final diferente
            });
          });

          setEvents(eventos); // Actualizar el estado con los eventos obtenidos
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      };

      fetchEvents(); // Llamar a la función para realizar la consulta
      fetchApi();
    }
  }, [selectedDate]);

  const peticionPost = async () => {
    console.log(selectedHora);
    console.log(selectedMaestro);
    console.log(selectedAlumno);

    const uid = localStorage.getItem("uid");
    if (!uid) {
      window.location.href = "/login";
      return;
    } else {
      try {
        const firestore = getFirestore(app);

        const timestamp = Timestamp.now(); // Obtener una instancia de Timestamp
        const date = timestamp.toDate(); // Convertir el Timestamp a un objeto Date

        // Ahora puedes formatear la fecha utilizando la biblioteca que estés utilizando, como date-fns
        const formattedDate = format(date, "dd/MM/yy");
        const docuRef = collection(firestore, `horarios`);

        await addDoc(docuRef, {
          nombre: selectedAlumno.label,
          alumnoUsername: selectedAlumno.username,
          alumnoId: selectedAlumno.id,
          altaHorario: formattedDate,
          maestroUsername: selectedMaestro.username,
          maestroId: selectedMaestro.id,
          horario: selectedHora.id,
          diaInicio: selectedDate,
          diaFin: selectedDate,
        });
        fetchApi();
        // Close the modal
        handleModalClose(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Función para manejar el cambio en el Autocomplete horas
  const handleAutocompleteHoraChange = (event, value) => {
    setSelectedHora(value); // Actualiza el estado con el valor seleccionado en el Autocomplete
  };

  // Función para manejar el cambio en el Autocomplete alumno
  const handleAutocompleteAlumnoChange = (event, value) => {
    setSelectedAlumno(value); // Actualiza el estado con el valor seleccionado en el Autocomplete
  };

  // Función para manejar el cambio en el Autocomplete maestros
  const handleAutocompleteMaestrosChange = (event, value) => {
    setSelectedMaestro(value); // Actualiza el estado con el valor seleccionado en el Autocomplete
  };

  //configurar días de calendario
  const workWeekView = {
    work_week: {
      title: "Work Week",
      weekdayFormat: "ddd", // Muestra solo los nombres de los días de la semana
      slotDuration: "00:50:00", // Duración de cada intervalo en el calendario
      slotLabelFormat: { hour: "numeric", minute: "2-digit" }, // Formato de las etiquetas de los intervalos
      dayLayoutAlgorithm: "no-overlap", // Evita superposición de eventos
      scrollToTime: moment().set({ hour: 8, minute: 0, second: 0 }), // Hora a la que se desplazará el calendario al cargarse
      eventLayout: "stack", // Eventos apilados en el mismo intervalo
      // Ajusta las horas mínimas y máximas según tus necesidades
      min: new Date().setHours(11, 0, 0),
      max: new Date().setHours(18, 50),
    },
  };

  return (
    <Container className={classes.root}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Calendar
            localizer={localizer}
            style={{
              height: 300,
              width: 700,
            }}
            events={events}
            views={Object.keys(workWeekView)}
            defaultView="work_week"
            selectable
            onSelectSlot={handleSelectSlot}
            // Establece la vista predeterminada como "work_week"
          />
        </Grid>
        <Modal
          open={openModal}
          onClose={handleModalClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className={classes.modal}
        >
          <div className={classes.modalContent}>
            <Typography variant="h6" id="modal-title">
              Agregar clase
            </Typography>
            <Grid item>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={alumnosMap}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Alumno" />
                )}
                onChange={handleAutocompleteAlumnoChange}
              />
            </Grid>
            <Grid item>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={horas}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Horas" />
                )}
                onChange={handleAutocompleteHoraChange}
              />
            </Grid>
            <Grid item>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={maestrosMap}
                sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Maestro" />
                )}
                onChange={handleAutocompleteMaestrosChange}
              />
            </Grid>
            <Button color="primary" onClick={() => peticionPost()}>
              Insertar
            </Button>
            <Button onClick={handleModalClose}>Close Modal</Button>
          </div>
        </Modal>
      </Grid>
    </Container>
  );
};

export default Horarios;
