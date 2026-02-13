import { startServer, stopServer } from ".";

 process.on("SIGINT", () => {
    stopServer()
 })

 startServer()