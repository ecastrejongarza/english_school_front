import { Container, Grid, TextField, makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { differenceInDays, addDays, isWeekend } from "date-fns";
import { Autocomplete } from "@mui/material";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import { app } from "../../firebase/firebase";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing(5),
  },
}));

const Horarios = () => {
  const classes = useStyles();
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [numWeekdaysInRange, setNumWeekdaysInRange] = useState(0);
  const [alumnos, setAlumnos] = useState();
  const [alumnosMap, setAlumnosMap] = useState();

  const handleDateChange = (value) => {
    setSelectedDates(value);
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
            listaRegistros.map((alumno) => ({ label: alumno.nombre }))
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else if (rol === "ALUMN") {
      }
    }
  };
  const calculateWeekdayDifference = (startDate, endDate) => {
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);
    let count = 0;

    while (currentDate <= finalDate) {
      if (!isWeekend(currentDate)) {
        count++;
      }
      currentDate = addDays(currentDate, 1);
    }

    return count;
  };

  useEffect(() => {
    const newNumWeekdaysInRange = calculateWeekdayDifference(
      selectedDates[0],
      selectedDates[1]
    );
    setNumWeekdaysInRange(newNumWeekdaysInRange);
  }, [selectedDates]);

  const prueba = [{ label: "hola", year: 123 }];

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
  return (
    <Container className={classes.root}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <Calendar
            calendarType="US"
            returnValue="range"
            selectRange
            value={selectedDates}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item>
          <p>Cantidad de días hábiles seleccionados: {numWeekdaysInRange}</p>
        </Grid>
        <Grid item>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={alumnosMap}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Movie" />}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Horarios;
