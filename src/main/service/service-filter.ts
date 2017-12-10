import { serviceTokenGenerator } from "./service-token-generator";

export const serviceFilter = (req, res, next) => {
    serviceTokenGenerator()
        .then(t => {
            req.headers['ServiceAuthorization'] = t;
            next();
        })
        .catch(error => {
            console.warn('Unsuccessful S2S authentication', error);
            next({
                status: error.status || 401
            });
        });
};
