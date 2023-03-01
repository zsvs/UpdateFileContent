class AbstractFactory {
    CreateInstance() {
        throw "You must override this method"
    }
}

module.exports = AbstractFactory;