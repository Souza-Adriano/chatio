export interface ResError {
    message: string;
    status: number;
}

export class ResponseError {
    private message: string;
    private status: number;
    private stack: string;

    constructor(message: string, status: number, error: Error) {
        this.message = message;
        this.status = status;
        this.stack = this.getStack(error);
    }

    public response(): ResError {
        return {
            message: this.message,
            status: this.status,
        };
    }

    private getStack(error: Error) {
        if (error.stack) { return error.stack; }
        return 'none';
    }

    public get stacktrace(): string {
        return this.stack;
    }
}

export default { ResponseError };