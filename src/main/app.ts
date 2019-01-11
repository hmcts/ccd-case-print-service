import * as bodyParser from "body-parser";
import * as config from "config";
import * as cookieParser from "cookie-parser";
import * as csrf from "csurf";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as favicon from "serve-favicon";
import * as healthcheck from "@hmcts/nodejs-healthcheck";
import * as path from "path";
import { authCheckerUserOnlyFilter } from "./user/auth-checker-user-only-filter";
import { Express, Logger } from "@hmcts/nodejs-logging";
import { Helmet, IConfig as HelmetConfig } from "./modules/helmet";
import { RouterFinder } from "./router/routerFinder";
import { serviceFilter } from "./service/service-filter";
import { setJwtCookieAndRedirect } from "./util/set-jwt-cookie-and-redirect";

const enableAppInsights = require("./app-insights/app-insights");

enableAppInsights();

const env = process.env.NODE_ENV || "dev";
export const app: express.Express = express();
app.locals.ENV = env;

// setup logging of HTTP requests
app.use(Express.accessLogger());

const logger = Logger.getLogger("app");

// secure the application by adding various HTTP headers to its responses
new Helmet(config.get<HelmetConfig>("security")).enableFor(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");
logger.info("****************");
logger.info("**************** " + JSON.stringify(config.get<HelmetConfig>("security")));

app.get("/health", healthcheck.configure({
  checks: {},
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "/public/img/favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

expressNunjucks(app);

if (config.useCSRFProtection === true) {
  const csrfOptions = {
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    },
  };

  app.use(csrf(csrfOptions), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
}

app.use("/", setJwtCookieAndRedirect);
app.use("/", authCheckerUserOnlyFilter);
app.use("/", serviceFilter);
app.use("/", RouterFinder.findAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
app.use((req, res, next) => {
  res.status(404);
  res.render("not-found");
});

// error handler
app.use((err, req, res, next) => {
  logger.error(`${err.stack || err}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});
