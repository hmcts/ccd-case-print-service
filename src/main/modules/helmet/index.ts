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
    app.use(helmet.contentSecurityPolicy(
      {
        directives: {
          connectSrc: [self],
          defaultSrc: ["'none'"],
          fontSrc: [self, "data:"],
          imgSrc: [self, googleAnalyticsDomain, hmctsPiwikDomain],
          objectSrc: [self],
          scriptSrc: [self, googleAnalyticsDomain, hmctsPiwikDomain],
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

  // TODO could have used the Expect-CT header, including its reporting function.
  // Expect-CT is safer than HPKP due to the flexibility it gives site operators to
  // recover from any configuration errors, and due to the built-in support offered by a number of CAs
  // @See Azure TLS Certificates changes
  // https://blogs.technet.microsoft.com/kv/2017/04/20/azure-tls-certificates-changes/?WT.mc_id=azurebg_email_Trans_33716_1407_SSL_Intermediate_Cert_Change
  // private setHttpPublicKeyPinning(app, hpkpConfig) {
  //   app.use(helmet.hpkp({
  //     maxAge: hpkpConfig.maxAge,
  //     sha256s: hpkpConfig.sha256s,
  //   }));
  // }
}
