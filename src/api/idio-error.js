class IdioError extends Error {
    constructor(message, { code = 500 } = {}) {
        super(message);

        this.code = code;
        this.name = `idio-graphql-error`;
        this.readme =
            "https://github.com/danstarns/idio-graphql/blob/master/README.md";
        this.chat = "https://spectrum.chat/idio-graphql";
    }
}

module.exports = IdioError;
