import * as express from "express";
import * as helmet from "helmet";

export interface IConfig {
  referrerPolicy: string;
  hpkp: {
    maxAge: number;
    sha256s: string[];
  };
}

const googleAnalyticsDomain = "*.google-analytics.com";
const hmctsPiwikDomain = "hmctspiwik.useconnect.co.uk";
const self = "'self'";

/**
 * Module that enables helmet in the application
 */
export class Helmet {

  constructor(public config: IConfig) {
  }

  public enableFor(app: express.Express) {
    // include default helmet functions
    app.use(helmet());

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, this.config.referrerPolicy);
    // this.setHttpPublicKeyPinning(app, this.config.hpkp);
  }

  private setContentSecurityPolicy(app) {
    const scriptSources = [self, googleAnalyticsDomain, hmctsPiwikDomain];

    // Adding 'unsafe-eval' weakens  CSP protection.
    // The conditional approach ensures it's only allowed in development
    // where debugging tools might need it, while maintaining security in production.
    // Add unsafe-eval only in development
    if (app.locals.developmentMode) {
      scriptSources.push("'unsafe-eval'");
      scriptSources.push("'unsafe-inline'");
    }

    app.use(helmet.contentSecurityPolicy(
      {
        directives: {
          connectSrc: [self],
          defaultSrc: ["'none'"],
          fontSrc: [self, "data:"],
          imgSrc: scriptSources,
          objectSrc: [self],
          scriptSrc: scriptSources,
          styleSrc: [self],
        },
      },
    ));
  }

  private setReferrerPolicy(app, policy) {
    if (!policy) {
      throw new Error("Referrer policy configuration is required");
    }

    app.use(helmet.referrerPolicy({policy}));
  }

  // private setHttpPublicKeyPinning(app, hpkpConfig) {
  //   app.use(helmet.hpkp({
  //     maxAge: hpkpConfig.maxAge,
  //     sha256s: hpkpConfig.sha256s,
  //   }));
  // }
}
