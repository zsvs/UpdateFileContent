const AbstractFactory = require("./AbstractFactory");
const Blob = require("../blob");

class FileFactory extends AbstractFactory{
    createInstance(fileName, content) {
        return new Blob(fileName, content)
    };
};

module.exports = FileFactory;