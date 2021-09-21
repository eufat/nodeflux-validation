const rewire = require("rewire")
const index = rewire("./index")
const getPlateFiles = index.__get__("getPlateFiles")
const camelToSentence = index.__get__("camelToSentence")
// @ponicode
describe("getPlateFiles", () => {
    test("0", () => {
        let callFunction = () => {
            getPlateFiles()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("camelToSentence", () => {
    test("0", () => {
        let callFunction = () => {
            camelToSentence("This is a Text")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            camelToSentence("Hello, world!")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            camelToSentence("foo bar")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            camelToSentence("Foo bar")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            camelToSentence(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
