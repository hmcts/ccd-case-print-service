import { default as bodyParser } from "body-parser";
import { getOrThrow, getOrDefault } from "./util/config";
import { default as cookieParser } from "cookie-parser";
import { default as csrf } from "@dr.pogodin/csurf";
import { default as express } from "express";
import { default as expressNunjucks } from "express-nunjucks";
import { default as favicon } from "serve-favicon";
import * as healthcheck from "@hmcts/nodejs-healthcheck";
import { default as path } from "node:path";
import { authCheckerUserOnlyFilter } from "./user/auth-checker-user-only-filter";
import { Express, Logger } from "@hmcts/nodejs-logging";
import { Helmet, IConfig as HelmetConfig } from "./modules/helmet";
import { importAll } from "./import-all/index";
import { serviceFilter } from "./service/service-filter";
import { setJwtCookieAndRedirect } from "./util/set-jwt-cookie-and-redirect";

import { enableAppInsights } from "./app-insights/app-insights";

enableAppInsights();

const env = process.env.NODE_ENV || "dev";
export const app: express.Express = express();
const appHealth: express.Express = express();
app.locals.ENV = env;

// setup logging of HTTP requests
app.use(Express.accessLogger());

const logger = Logger.getLogger("app");

// secure the application by adding various HTTP headers to its responses
new Helmet(getOrThrow<HelmetConfig>("security")).enableFor(app);

// view engine setup
app.set("views", [path.join(__dirname, "views"), "node_modules/govuk-frontend/dist"]);
app.set("view engine", "njk");
logger.info("****************");
logger.info("**************** " + JSON.stringify(getOrThrow<HelmetConfig>("security")));

const healthConfig = {
  checks: {}
};
healthcheck.addTo(appHealth, healthConfig);
app.use(appHealth);


const caching = {cacheControl: true, setHeaders: (res) => res.setHeader("Cache-Control", "max-age=604800")};

app.use(express.static(path.join(__dirname, "public"), caching));
app.use("/assets", express.static("node_modules/govuk-frontend/dist/govuk/assets", caching));
app.use(favicon(path.join("node_modules", "govuk-frontend", "dist", "govuk", "assets", "images", "favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

expressNunjucks(app);

if (getOrDefault<boolean>("useCSRFProtection", false) === true) {
  const csrfOptions = {
    cookie: {
      httpOnly: true,
      key: "_csrf",
      path: "/",
      sameSite: "lax" as const,
      secure: true
    }
  };

  app.use(csrf(csrfOptions), (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
}

app.use("/", setJwtCookieAndRedirect);
app.use("/", authCheckerUserOnlyFilter);
app.use("/", serviceFilter);
app.use("/", importAll(path.join(__dirname, "routes")));

// returning "not found" page for requests with paths not resolved by the router
app.use((req, res, next) => {
  res.status(404);
  res.render("not-found");
  next = () => null; // avoid "next is declared but its value is never read" eslint warning
});

// error handler
app.use((err, req, res, next) => {
  logger.error(`${err.stack || err}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === "development" ? err : {};

  res.status(err.status || 500);
  if (err.code === "INVALID_CASE_ID") {
    res.send(err);
  } else {
    res.render("error");
  }
});
