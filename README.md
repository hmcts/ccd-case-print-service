# Case Data Print Service
Implementation of a default print service for case data.

## Overview
[Express](http://expressjs.com) application that allows an authorised user to retrieve case data in a printable format.

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/en) version 8.8.0

### Environment variables

The following environment variables are required:

| Name | Default | Description |
|------|---------|-------------|
| IDAM_BASE_URL | - | Base URL for IdAM's User API service (idam-app). `http://localhost:4501` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_S2S_URL | - | Base URL for IdAM's S2S API service (service-auth-provider). `http://localhost:4502` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_SERVICE_KEY | - | Print Service's IdAM S2S micro-service secret key. This must match the IdAM instance it's being run against. |
| CASE_DATA_STORE_URL | - | Base URL for the Case Data Store service. `http://localhost:4452` for the dockerised local instance. |

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
