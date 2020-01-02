const utils = require("../src/utils");

describe("Utility functions", () => {
   describe("validateHttpStatusCode", () => {
      it("should return true if a valid status code is passed", () => {
         const testStatusCode = 401,
            isStatusCodeValid = utils.validateHttpStatusCode(testStatusCode);

         expect(isStatusCodeValid).toBe(true);
      });

      it("should return false if an invalid status code is passed", () => {
         const testStatusCode = 600,
            isStatusCodeValid = utils.validateHttpStatusCode(testStatusCode);

         expect(isStatusCodeValid).toBe(false);
      });
   });
});