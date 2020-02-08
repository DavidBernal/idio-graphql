const util = require("util");

const sleep = util.promisify(setImmediate);

async function* streamToIterator(stream) {
    let buffers = [];
    let error;
    let active = true;

    stream.on("data", (buff) => buffers.push(buff));

    stream.on("error", (err) => {
        error = err;
        active = false;
    });

    stream.on("end", () => {
        active = false;
    });

    while (buffers.length || active) {
        if (error) {
            throw error;
        }

        // eslint-disable-next-line no-await-in-loop
        await sleep();

        const [result, ...restOfBuffers] = buffers;

        buffers = [...restOfBuffers];

        /* istanbul ignore next */
        if (!result) {
            // eslint-disable-next-line no-continue
            continue;
        } else {
            yield JSON.parse(result.toString());
        }
    }
}

module.exports = streamToIterator;
