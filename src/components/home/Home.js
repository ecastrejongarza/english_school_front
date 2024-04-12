import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography, Grid, IconButton } from "@material-ui/core";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import logo from "../logo/logo.png";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing(5),
  },
  logo: {
    maxWidth: 200,
  },
  socialIcons: {
    marginTop: theme.spacing(2),
  },
}));

const Home = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState("");

  const message = location.state && location.state.message;
  //const currentUser = localStorage.getItem("userId");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setCurrentUser(localStorage.getItem("userId"));
    } else {
      setCurrentUser("");
    }
  }, [user]);

  const classes = useStyles();
  return (
    <Container className={classes.root}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <img src={logo} alt="Logo" className={classes.logo} />
        </Grid>
        <Grid item>
          <Typography variant="h4" align="center">
            ¡Bienvenido a nuestra página!
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" align="center">
            Síguenos en nuestras redes sociales:
          </Typography>
        </Grid>
        <Grid item className={classes.socialIcons}>
          <IconButton>
            <FacebookIcon />
          </IconButton>
          <IconButton>
            <InstagramIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
