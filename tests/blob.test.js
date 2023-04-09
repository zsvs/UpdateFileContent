const FileFactory = require("../src/fabrics/FileFactory")



describe("Blob test", () => {

    test("setContent test", () => {
        const blobFactory = new FileFactory();
        const blob = blobFactory.createInstance("fileName", "content");
        blob.setContent("newContent")
        expect(blob.content).toBe("newContent");
    });
});