import express, { Express, Request, Response } from "express";
import http from "http";
import CONFIG, {STATUS_CODES} from "./config";


const app: Express = express();
const server = http.createServer(app);

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.json(
        {   
            success: true,
            message: "Idempotency Gateway",
            status: STATUS_CODES.OK
        }
    ).status(STATUS_CODES.OK)
})

async function startServer() {
    try {
        server.listen(CONFIG.PORT, () => {
            console.log(`Server running on port ${CONFIG.PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

async function stopServer() {
    try {
        server.close(() => {
            console.log("Server closed")
        })
    } catch (error) {
        console.log(error)
    }
}

export { startServer, stopServer }