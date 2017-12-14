import * as logging from "@hmcts/nodejs-logging";
import * as bodyParser from "body-parser";
import * as config from "config";
import * as cookieParser from "cookie-parser";
import * as csrf from "csurf";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import { Helmet, IConfig as HelmetConfig } from "modules/helmet";
import * as path from "path";
import { RouterFinder } from "router/routerFinder";
import * as favicon from "serve-favicon";
import { setJwtCookieAndRedirect } from "./util/set-jwt-cookie-and-redirect";
import { authCheckerUserOnlyFilter} from "./user/auth-checker-user-only-filter";
import { serviceFilter } from "./service/service-filter";

const env = process.env.NODE_ENV || "development";
export const app: express.Express = express();
app.locals.ENV = env;

// TODO: adjust these values to your application
logging.config({
  environment: process.env.NODE_ENV,
  microservice: "ccd-case-print-service",
  team: "ccd",
});

// setup logging of HTTP requests
app.use(logging.express.accessLogger());

const logger = logging.getLogger("app");

// secure the application by adding various HTTP headers to its responses
new Helmet(config.get<HelmetConfig>("security")).enableFor(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");

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
