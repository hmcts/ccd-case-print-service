export class EnumerationAttemptError extends Error {
    code: string = "ENUMERATION_ATTEMPT";
    error : string;
    status : number;

    constructor(message : string, error : string, status : number) {
        super(message);
        this.error = error;
        this.status = status;
    }
}
