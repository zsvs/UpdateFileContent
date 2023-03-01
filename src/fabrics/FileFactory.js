const AbstractFactory = require("./AbstractFactory");
const Blob = require("../blob");

class FileFactory extends AbstractFactory{
    CreateInstance(fileName, content) {
        return new Blob(fileName, content)
    };
};

module.exports = FileFactory;