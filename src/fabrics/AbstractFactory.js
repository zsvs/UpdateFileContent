class AbstractFactory {
    createInstance() {
        throw "You must override this method"
    }
}

module.exports = AbstractFactory;