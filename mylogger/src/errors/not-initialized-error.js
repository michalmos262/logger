class NotInitializedError extends Error {
    constructor(message = "Logger not initialized. Call init() first.") {
        super(message);
        this.name = "NotInitializedError";
    }
}

module.exports = NotInitializedError;