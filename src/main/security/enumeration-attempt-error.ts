export class EnumerationAttemptError extends Error {
    public code: string = "ENUMERATION_ATTEMPT";
    public error: string;
    public status: number;

    constructor(message: string, error: string, status: number) {
        super(message);
        this.error = error;
        this.status = status;
    }
}
