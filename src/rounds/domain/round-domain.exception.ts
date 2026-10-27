export class RoundDomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RoundDomainException';
    }
}
