import { ModuleSynchronizer } from ".";

jest.useFakeTimers();

describe("ModuleSynchronizer", () => {
  it("should not call module functions if promise is not resolved", async () => {
    const module = {
      add: jest.fn((a: number, b: number) => a + b),
      subtract: jest.fn((a: number, b: number) => a - b),
    };
    const testModule = new Promise<typeof module>(() => {});

    const synchronizer = ModuleSynchronizer(testModule);

    synchronizer.add(1, 2);
    synchronizer.subtract(1, 2);

    expect(module.add).not.toHaveBeenCalled();
    expect(module.subtract).not.toHaveBeenCalled();
  });

  it("should not call module functions with correct order", async () => {
    const module = {
      add: jest.fn((a, b) => a + b),
      subtract: jest.fn((a: number, b: number) => a - b),
    };
    const testModule = Promise.resolve(module);

    const synchronizer = ModuleSynchronizer(testModule);

    const adderPromise = synchronizer.add(1, 2);
    const subtractPromise = synchronizer.subtract(1, 2);

    await Promise.all([adderPromise, subtractPromise] as const);

    expect(module.add.mock.invocationCallOrder[0]).toBeLessThan(
      module.subtract.mock.invocationCallOrder[0]
    );
  });

  it("should call underlying module with correct parameters", async () => {
    const module = {
      add: jest.fn((a, b) => a + b),
      subtract: jest.fn((a: number, b: number) => a - b),
    };
    const testModule = Promise.resolve(module);

    const synchronizer = ModuleSynchronizer(testModule);

    const adderPromise = synchronizer.add(1, 2);
    const subtractPromise = synchronizer.subtract(2, 3);

    await Promise.all([adderPromise, subtractPromise] as const);

    expect(module.add).toBeCalledWith(1, 2);
    expect(module.subtract).toBeCalledWith(2, 3);
  });

  it("should reject each call if the module fails to load", async () => {
    const module = {
      add: jest.fn((a, b) => a + b),
      subtract: jest.fn((a: number, b: number) => a - b),
    };
    const customError = new Error("Custom error");
    const testModule = Promise.reject(customError) as Promise<typeof module>;

    const synchronizer = ModuleSynchronizer(testModule);

    return expect(() => synchronizer.add(1, 2)).rejects.toThrow(customError);
  });

  it("should handle functions", async () => {
    const module = jest.fn((a, b) => a + b);
    const testModule = Promise.resolve(module);

    const synchronizer = ModuleSynchronizer(testModule);

    const adderPromise = await synchronizer(4, 4);

    return expect(adderPromise).toBe(8);
  });

  it("should call main function module after it has been loaded", async () => {
    const module = jest.fn((a, b) => a + b);
    const testModule = Promise.resolve(module);

    const synchronizer = ModuleSynchronizer(testModule);

    await synchronizer(4, 4);
    synchronizer(4, 4);

    return expect(module).toBeCalledTimes(2);
  });

  it("should call main object module after it has been loaded", async () => {
    const module = {
      add: jest.fn((a, b) => a + b),
      subtract: jest.fn((a: number, b: number) => a - b),
    };
    const testModule = Promise.resolve(module);

    const synchronizer = ModuleSynchronizer(testModule);

    await synchronizer.add(1, 2);
    synchronizer.add(2, 3);
    expect(module.add).toBeCalledTimes(2);
  });
});
