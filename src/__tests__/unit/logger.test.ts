import LoggerService from "../../app/services/LoggerService";
const { readFile, mkdir, rm, readdir } = require("fs").promises;

describe("Logger", () => {
  jest.setTimeout(10000); // test time limit - 10 seconds
  
  const logsDirectory = "./test-logs/"
  let loggerService;

  beforeEach(async () => {
    loggerService = new LoggerService(logsDirectory);
    await mkdir(logsDirectory);
  });

  afterEach( async () => {
    await rm(logsDirectory, { recursive: true, force: true });
  })

  test("Should create log from object", async () => {
    const logfile = await loggerService.log({
      teste1: 1,
      teste2: 2,
      teste3: 3,
      teste4: 4,
      teste5: 5,
    })
    const csvLogData = "teste1,teste2,teste3,teste4,teste5;\n1,2,3,4,5;\n"

    const logData = await readFile(logfile, 'utf8');

    expect(logData).toBe(csvLogData)
  });

  test("Should create a second log file after 6 seconds", async () => {
    const filesBefore = await readdir(logsDirectory);

    // create a new log file each 6s
    loggerService.setTimeIntervalInMinutes(0.1);
    await loggerService.log({ teste6: 6 })

    // wait 7s
    await new Promise((r) => setTimeout(r, 7000));

    await loggerService.log({ teste7: 7 })
    const filesAfter = await readdir(logsDirectory);

    expect(filesAfter.length-filesBefore.length).toBe(2);
  });
});
