import pino from "pino";
import CONFIG from "../config";


const logger = pino({
    level: CONFIG.LOG_LEVEL,
    transport: CONFIG.ENV !== "production" ? 
        {
            target: "pino-pretty",
            options: {
                colorize: true,
                ignore: "pid,hostname",
                translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            }
        }
     : undefined   
})

export {logger}
