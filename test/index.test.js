const { STATUS_CODES } = require("http"),
   { errorHandler } = require("../helpers/error");

describe("Error handler", () => {
   describe("Call without passing parameters", () => {
      let errorObject;

      beforeAll(() => {
         errorObject = errorHandler();
      })

      it("should return an instance of the error object", () => {
         expect(errorObject).toBeInstanceOf(Error);
      });

      it("should return with the status property's value of 500", () => {
         expect(errorObject.status).toBe(500);
      });

      it("should return with the message property's value of the status code 500 message", () => {
         const expectedMessage = STATUS_CODES["500"];
         expect(errorObject.message).toBe(expectedMessage);
      });
   });

   describe("Call passing the first parameter", () => {
      const testStatus = 200;
      let errorObject;

      describe("Passing a valid parameter", () => {
         beforeAll(() => {
            errorObject = errorHandler(testStatus);
         })

         it("should return an instance of the error object", () => {
            expect(errorObject).toBeInstanceOf(Error);
         });

         it("should return with the status property's value of the same passed", () => {
            expect(errorObject.status).toBe(testStatus);
         });

         it("should return with the message property's value of the passed status message", () => {
            const expectedMessage = STATUS_CODES[testStatus];
            expect(errorObject.message).toBe(expectedMessage);
         });
      });
   });
});