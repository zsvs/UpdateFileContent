const AbstractFactory = require("../src/fabrics/AbstractFactory");

describe("AbstractFactory test", () => {

    test("Creation throw error", () => {
        const factory = new AbstractFactory();
        expect(() => {factory.createInstance()}).toThrow("You must override this method");
    });

});