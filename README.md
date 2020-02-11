# ccd-case-print-service
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/hmcts/ccd-case-print-service.svg?branch=master)](https://travis-ci.org/hmcts/ccd-case-print-service)
[![codecov](https://codecov.io/gh/hmcts/ccd-case-print-service/branch/master/graph/badge.svg)](https://codecov.io/gh/hmcts/ccd-case-print-service)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/37ac45c07384494885609297b8708717)](https://www.codacy.com/app/adr1ancho/ccd-case-print-service?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=hmcts/ccd-case-print-service&amp;utm_campaign=Badge_Grade)
[![HitCount](http://hits.dwyl.io/hmcts/ccd-case-print-service.svg)](#ccd-case-print-service)
[![Issue Stats](http://issuestats.com/github/hmcts/ccd-case-print-service/badge/pr)](http://issuestats.com/github/hmcts/ccd-case-print-service)


Implementation of a default print service for case data.

## Overview
[Express](http://expressjs.com) application that allows an authorised user to retrieve case data in a printable format.

The output comprises a summary, with some key information such as Case Number and user requesting the printout, followed by a dump of the case details in JSON format.

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/en) version >= 12.0.0

### Environment variables

The following environment variables are required:

| Name | Default | Description |
|------|---------|-------------|
| IDAM_BASE_URL | - | Base URL for IdAM's User API service (idam-app). `http://localhost:4501` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_S2S_URL | - | Base URL for IdAM's S2S API service (service-auth-provider). `http://localhost:4502` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_PRINT_SERVICE_KEY | - | Print Service's IdAM S2S micro-service secret key. This must match the IdAM instance it's being run against. |
| CASE_DATA_STORE_URL | - | Base URL for the Case Data Store service. `http://localhost:4452` for the dockerised local instance. |
| APPINSIGHTS_INSTRUMENTATIONKEY | - | Secret for Microsoft Insights logging, can be a dummy string in local. |

### Building

The project uses [npm](https://www.npmjs.com). To build it, execute the following command:

```bash
npm install
```
### Running

Start the application by executing the following command:

```bash
npm start
```

**Note:** You can also use [yarn](https://yarnpkg.com/lang/en/) in place of npm, in both commands above.

### Accessing the service

The application uses HTTP, port 3100 by default.

Access to any case data requires an authorised user that is already authenticated via IdAM (and thus, has been granted a Java Web Token (JWT) for the session).

Point your browser at http://localhost:3100/jurisdictions/{jid}/case-types/{ctid}/cases/{cid}?jwt={token}, where:

- `{jid}` is the Jurisdiction ID, for example, `PROBATE`
- `{ctid}` is the Case Type ID, for example, `GrantOfRepresentation`
- `{cid}` is the Case ID, for example, `1111222233334444`
- `{token}` is the user's JWT, which is already stored as a browser cookie for an authenticated user

Alternatively, you can mimic the result of the OAuth 2.0 "lite" authentication flow, by omitting the `jwt` query parameter from the URL above, and setting the JWT as a cookie instead:

1. Open your browser's Developer Tools window (typically by pressing F12).
2. In the console, enter the JavaScript command: `document.cookie="accessToken={token}"` where `{token}` is the user's JWT.

### Custom Routes

These can be used to render output using external Nunjucks templates. Routes should be added to the `src/main/routes` directory.

#### A note on Character Encoding and Displaying "Special" Characters

All routes should ensure the Case Print Service returns the correct character encoding (character set) in the HTTP response headers. It should be UTF-8. This is done by calling the following on the response object (`res` in this case):

```
res.set("charset", "utf-8");
```

This must be done prior to a final call on the response, such as `res.send(...)`.

In addition, if the Nunjucks template to be rendered contains any "special" characters, such as currency symbols or "curly" versions of quote marks, then the template should be edited and encoded as UTF-8.

If, for whatever reason, this is not possible then these characters must be replaced with the regular ASCII versions where appropriate (e.g. straight quote marks), or (ideally) the corresponding HTML entities (e.g. `&pound;`, `&lsquo;`, `&rsquo;`).
