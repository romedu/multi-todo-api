const { STATUS_CODES } = require("http"),
   { errorHandler } = require("../src/helpers/error");

describe("Error handler", () => {
   const defaultErrorStatusCode = 500,
      defaultErrorMessage = STATUS_CODES[defaultErrorStatusCode];

   describe("Call without passing parameters", () => {
      let errorObject;

      beforeAll(() => {
         errorObject = errorHandler();
      })

      it("should return an instance of the error object", () => {
         expect(errorObject).toBeInstanceOf(Error);
      });

      it("should return with the status property's value of 500", () => {
         expect(errorObject.status).toBe(defaultErrorStatusCode);
      });

      it("should return with the message property's value of the status code 500 message", () => {
         expect(errorObject.message).toBe(defaultErrorMessage);
      });
   });

   describe("Call passing the status code", () => {
      let errorObject;

      describe("Passing a valid parameter", () => {
         const testStatusCode = 200;

         beforeAll(() => {
            errorObject = errorHandler(testStatusCode);
         })

         it("should return an instance of the error object", () => {
            expect(errorObject).toBeInstanceOf(Error);
         });

         it("should return with the status property's value of the same passed", () => {
            expect(errorObject.status).toBe(testStatusCode);
         });

         it("should return with the message property's value of the passed status message", () => {
            const expectedErrorMessage = STATUS_CODES[testStatusCode];
            expect(errorObject.message).toBe(expectedErrorMessage);
         });
      });

      describe("Passing an invalid parameter", () => {
         const testStatusCode = 600;

         beforeAll(() => {
            errorObject = errorHandler(testStatusCode);
         });

         it("should return an instance of the error object", () => {
            expect(errorObject).toBeInstanceOf(Error);
         });

         it("should return with the status property's default value", () => {
            expect(errorObject.status).toBe(defaultErrorStatusCode);
         });

         it("should return with the message property's default value", () => {
            expect(errorObject.message).toBe(defaultErrorMessage);
         });
      });
   });

   describe("Call passing the 2 parameters", () => {
      const testErrorMessage = STATUS_CODES[defaultErrorStatusCode];

      describe("Passing a valid status code", () => {
         const testStatusCode = 404;
         let errorObject;

         beforeAll(() => {
            errorObject = errorHandler(testStatusCode, testErrorMessage);
         });

         it("should return an instance of the error object", () => {
            expect(errorObject).toBeInstanceOf(Error);
         });

         it("should return with the status property's value of the same passed", () => {
            expect(errorObject.status).toBe(testStatusCode);
         });

         it("should return with the message property's value of the passed status message", () => {
            expect(errorObject.message).toBe(testErrorMessage);
         });
      });

      describe("Passing an invalid status code", () => {
         const testStatusCode = 600;
         let errorObject;

         beforeAll(() => {
            errorObject = errorHandler(testStatusCode, testErrorMessage);
         });

         it("should return an instance of the error object", () => {
            expect(errorObject).toBeInstanceOf(Error);
         });

         it("should return with the status property's default value", () => {
            expect(errorObject.status).toBe(defaultErrorStatusCode);
         });

         it("should return with the message property's value of the passed status message", () => {
            expect(errorObject.message).toBe(testErrorMessage);
         });
      });
   })
});