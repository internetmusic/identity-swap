import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { SnackbarProvider } from "notistack";

import {
  makeStyles,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import green from "@material-ui/core/colors/green";
import grey from "@material-ui/core/colors/grey";
import { v4 as uuid } from "uuid";

import "./App.css";
import { PoolsList } from "../features/pool/PoolsList";
import { addPool } from "../features/pool/PoolSlice";

import { addNotification } from "../features/notification/NotificationSlice";
import Notifier from "../features/notification/Notification";

import WalletView from "../features/wallet/WalletView";
import { send } from "../features/wallet/WalletSlice";
import { RootState } from "./rootReducer";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function App(): JSX.Element {
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: green,
          secondary: grey,
        },
      }),
    [prefersDarkMode]
  );

  const dispatch = useDispatch();
  const { pools } = useSelector((state: RootState) => state.pool);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <div className="App">
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Civic AMM
              </Typography>
              <WalletView />
            </Toolbar>
          </AppBar>
          <div>
            <h1>Pools</h1>
            <PoolsList pools={pools} />
            <button
              onClick={() => {
                dispatch(
                  addPool({ address: uuid(), tokenA: "a", tokenB: "b" })
                );
                dispatch(addNotification({ message: "Pool added" }));
              }}
            >
              Add
            </button>
            <button onClick={() => dispatch(send())}>Send Dummy TX</button>
          </div>
        </div>
        <Notifier />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;