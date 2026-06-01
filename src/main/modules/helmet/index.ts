import * as express from "express";
import helmet, { referrerPolicy, contentSecurityPolicy } from "helmet";

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

  private readonly config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  public enableFor(app: express.Express) {
    // include default helmet functions
    app.use(helmet());

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, this.config.referrerPolicy);
    // this.setHttpPublicKeyPinning(app, this.config.hpkp);
  }

  private setContentSecurityPolicy(app: express.Express) {
    app.use(contentSecurityPolicy(
      {
        directives: {
          connectSrc: [self],
          defaultSrc: ["'none'"],
          fontSrc: [self, "data:"],
          imgSrc: [self, googleAnalyticsDomain, hmctsPiwikDomain],
          objectSrc: [self],
          scriptSrc: [self, googleAnalyticsDomain, hmctsPiwikDomain],
          styleSrc: [self]
        }
      }
    ));
  }

  private setReferrerPolicy(app: express.Express, policy: any) {
    if (!policy) {
      throw new Error("Referrer policy configuration is required");
    }

    app.use(referrerPolicy({"policy": policy}));
  }

  // private setHttpPublicKeyPinning(app, hpkpConfig) {
  //   app.use(helmet.hpkp({
  //     maxAge: hpkpConfig.maxAge,
  //     sha256s: hpkpConfig.sha256s,
  //   }));
  // }
}
