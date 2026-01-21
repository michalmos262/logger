class ApiKeyIsMissingError extends Error {
    constructor(message = "apiKey is required in production") {
        super(message);
        this.name = "ApiKeyIsMissingError";
    }
}

module.exports = ApiKeyIsMissingError;