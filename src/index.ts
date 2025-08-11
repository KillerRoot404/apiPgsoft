import express, { Request, Response } from "express"
import helmet from "helmet"
import cors from "cors"
import http from "http"
import logger from "./logger/index"
import routes from "./routes"
import * as figlet from "figlet"
import path from "path"
import { Server, Socket } from "socket.io"

import allfunctions from "./functions/allfunctions"
import { emitirEventoInterno, adicionarListener } from "./serverEvents"
import "dotenv/config"

const app = express()
const httpserver = http.createServer(app)
const io = new Server(httpserver)

// Optionally expose the same app also on backend port (8001) for ingress '/api' routing
const backendPort = Number(process.env.API_PORT || 8001)
const httpserverApi = http.createServer(app)

console.log(figlet.textSync("API DE JOGOS JOHN"), "\n")

declare module "express-serve-static-core" {
   interface Request {
      io: Server
   }
}
const users = new Map<string, any>()

declare module "express-session" {
   export interface SessionData {
      steps: any
   }
}

io.on("connection", async (socket: Socket) => {
   console.log("Usuário Conectado")

   socket.on("join", async (socket1) => {
      const token: any = socket1.token
      const gameid: any = socket1.gameId

      setInterval(async function () {
         const user = await allfunctions.getuserbytoken(token)

         if (!user[0]) {
            socket.disconnect(true)
            return false
         }

         const retornado = user[0].valorganho
         const valorapostado = user[0].valorapostado

         const rtp = Math.round((retornado / valorapostado) * 100)

         if (isNaN(rtp) === false) {
            await allfunctions.updatertp(token, rtp)
         }
      }, 10000)
   })

   adicionarListener("attganho", async (dados) => {
      users.forEach(async (valor, chave) => {
         let newvalue = parseFloat(users.get(socket.id).aw) + dados.aw
         users.set(socket.id, {
            aw: newvalue,
         })
      })
      emitirEventoInterno("awreceive", {
         aw: users.get(socket.id).aw,
      })
   })

   adicionarListener("att", (dados) => {
      users.forEach((valor, chave) => {
         if (valor.token === dados.token) {
            return false
         } else {
            users.set(socket.id, {
               token: dados.token,
               username: dados.username,
               bet: dados.bet,
               saldo: dados.saldo,
               rtp: dados.rtp,
               agentid: dados.agentid,
               socketid: socket.id,
               gamecode: dados.gamecode,
               aw: 0,
            })
         }
      })

      if (Object.keys(users).length === 0) {
         users.set(socket.id, {
            token: dados.token,
            username: dados.username,
            bet: dados.bet,
            saldo: dados.saldo,
            rtp: dados.rtp,
            agentid: dados.agentid,
            socketid: socket.id,
            gamecode: dados.gamecode,
            aw: 0,
         })
      }
   })

   socket.on("disconnect", (reason) => {
      users.delete(socket.id)

      console.log("Cliente desconectado:", reason)
   })
})

app.use(cors({ credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/", express.static(path.join(__dirname, "public")))

app.use(
   helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: {
         "default-src": ["'self'"],
         "base-uri": "'self'",
         "font-src": ["'self'", "https:", "data:"],
         "frame-ancestors": ["'self'"],
         "img-src": ["'self'", "data:", "https:"],
         "object-src": ["'none'"],
         "script-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
         "script-src-attr": "'none'",
         "style-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
         "connect-src": ["'self'"]
      },
   }),
)

// Middleware para adicionar o socket.io em cada requisição
app.use((req: Request, res: Response, next) => {
   req.io = io // Adiciona o socket.io ao objeto req
   next()
})

// Rota para o painel administrativo
app.get('/admin', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'))
})

// Status endpoint
app.get('/status', (req, res) => {
   res.json({ 
      status: 'online', 
      timestamp: new Date().toISOString(),
      message: 'Casino API is running with Admin Panel'
   })
})

app.use(routes)

httpserver.listen(process.env.PORT, () => {
   logger.info("SERVIDOR INICIADO JOHNGAMES " + process.env.PORT)
})

httpserverApi.listen(backendPort, () => {
   logger.info("SERVIDOR API EXTRA (Ingress) " + backendPort)
})
