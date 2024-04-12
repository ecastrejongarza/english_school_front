import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

/* This function login a registered user */
export async function loginUser(login) {
  try {
    const response = await api.post("/auth/login", login);
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

//Funcion para obtener todos los alumnos con rol ADMIN
export async function getAllAlumnsADMIN() {
  const rol = "ALUMN";
  try {
    const response = await api.get(`/admin/all/${rol}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {}
}
