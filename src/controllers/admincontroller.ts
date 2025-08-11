import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import logger from "../logger"
import "dotenv/config"
import apifunctions from "../functions/apifunctions"
import allfunctions from "../functions/allfunctions"

// Admin credentials (em produção, isso deveria vir do banco de dados)
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "$2b$10$rOvLrm8YQj4x8YrJhJGZUOpZVaKKKPqF8FvZjTKKEaZKjKJZGUOpZ" // senha: admin123

export default {
   // ===== AUTENTICAÇÃO =====
   async login(req: Request, res: Response) {
      try {
         const { username, password } = req.body

         if (!username || !password) {
            return res.status(400).json({
               success: false,
               message: "Username e password são obrigatórios"
            })
         }

         if (username !== ADMIN_USERNAME) {
            return res.status(401).json({
               success: false,
               message: "Credenciais inválidas"
            })
         }

         const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD)
         if (!isValidPassword) {
            return res.status(401).json({
               success: false,
               message: "Credenciais inválidas"
            })
         }

         const token = jwt.sign(
            { username: ADMIN_USERNAME, role: "admin" },
            process.env.API_SECRET || "default-secret",
            { expiresIn: "8h" }
         )

         res.json({
            success: true,
            message: "Login realizado com sucesso",
            token,
            user: { username: ADMIN_USERNAME, role: "admin" }
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
         })
      }
   },

   // ===== DASHBOARD ESTATÍSTICAS =====
   async getDashboardStats(req: Request, res: Response) {
      try {
         const agents = await apifunctions.getagentbyagentToken("")
         const users = await allfunctions.getAllUsers()
         
         const stats = {
            totalAgents: agents.length || 0,
            totalUsers: users.length || 0,
            totalBalance: users.reduce((sum: number, user: any) => sum + (user.saldo || 0), 0),
            totalWagered: users.reduce((sum: number, user: any) => sum + (user.valorapostado || 0), 0),
            totalWon: users.reduce((sum: number, user: any) => sum + (user.valorganho || 0), 0),
            avgRTP: users.length > 0 ? users.reduce((sum: number, user: any) => sum + (user.rtp || 0), 0) / users.length : 0,
            recentActivity: {
               newUsersToday: 0, // Implementar contagem por data
               gamesPlayedToday: 0,
               revenueToday: 0
            }
         }

         res.json({
            success: true,
            data: stats
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao buscar estatísticas"
         })
      }
   },

   // ===== GESTÃO DE AGENTES =====
   async getAllAgents(req: Request, res: Response) {
      try {
         const agents = await allfunctions.getAllAgents()
         
         res.json({
            success: true,
            data: agents
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao buscar agentes"
         })
      }
   },

   async createAgent(req: Request, res: Response) {
      try {
         const { agentCode, agentToken, secretKey, callbackurl } = req.body

         if (!agentCode || !agentToken || !secretKey) {
            return res.status(400).json({
               success: false,
               message: "agentCode, agentToken e secretKey são obrigatórios"
            })
         }

         const result = await allfunctions.createAgent({
            agentCode,
            agentToken,
            secretKey,
            callbackurl: callbackurl || null,
            saldo: 0
         })

         if (result.affectedRows > 0) {
            res.json({
               success: true,
               message: "Agente criado com sucesso",
               data: { id: result.insertId }
            })
         } else {
            res.status(400).json({
               success: false,
               message: "Erro ao criar agente"
            })
         }

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro interno do servidor"
         })
      }
   },

   async updateAgent(req: Request, res: Response) {
      try {
         const { id } = req.params
         const updates = req.body

         const result = await allfunctions.updateAgent(parseInt(id), updates)

         if (result.affectedRows > 0) {
            res.json({
               success: true,
               message: "Agente atualizado com sucesso"
            })
         } else {
            res.status(404).json({
               success: false,
               message: "Agente não encontrado"
            })
         }

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao atualizar agente"
         })
      }
   },

   async deleteAgent(req: Request, res: Response) {
      try {
         const { id } = req.params

         const result = await allfunctions.deleteAgent(parseInt(id))

         if (result.affectedRows > 0) {
            res.json({
               success: true,
               message: "Agente excluído com sucesso"
            })
         } else {
            res.status(404).json({
               success: false,
               message: "Agente não encontrado"
            })
         }

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao excluir agente"
         })
      }
   },

   // ===== GESTÃO DE USUÁRIOS =====
   async getAllUsers(req: Request, res: Response) {
      try {
         const page = parseInt(req.query.page as string) || 1
         const limit = parseInt(req.query.limit as string) || 50
         const offset = (page - 1) * limit

         const users = await allfunctions.getUsersPaginated(limit, offset)
         const totalUsers = await allfunctions.getUsersCount()

         res.json({
            success: true,
            data: {
               users,
               pagination: {
                  current: page,
                  total: Math.ceil(totalUsers / limit),
                  limit,
                  totalRecords: totalUsers
               }
            }
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao buscar usuários"
         })
      }
   },

   async getUserDetails(req: Request, res: Response) {
      try {
         const { id } = req.params
         const user = await allfunctions.getUserById(parseInt(id))

         if (!user) {
            return res.status(404).json({
               success: false,
               message: "Usuário não encontrado"
            })
         }

         res.json({
            success: true,
            data: user
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao buscar detalhes do usuário"
         })
      }
   },

   async updateUserBalance(req: Request, res: Response) {
      try {
         const { id } = req.params
         const { balance } = req.body

         if (typeof balance !== "number") {
            return res.status(400).json({
               success: false,
               message: "Saldo deve ser um número"
            })
         }

         await apifunctions.setbalanceuserbyid(parseInt(id), balance)

         res.json({
            success: true,
            message: "Saldo atualizado com sucesso"
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao atualizar saldo"
         })
      }
   },

   // ===== RELATÓRIOS =====
   async getFinancialReport(req: Request, res: Response) {
      try {
         const { startDate, endDate } = req.query
         
         // Por enquanto, relatório básico - pode ser expandido com filtros de data
         const users = await allfunctions.getAllUsers()
         const agents = await allfunctions.getAllAgents()

         const report = {
            totalRevenue: users.reduce((sum: number, user: any) => sum + (user.valorapostado || 0), 0),
            totalPayouts: users.reduce((sum: number, user: any) => sum + (user.valorganho || 0), 0),
            totalProfit: users.reduce((sum: number, user: any) => sum + (user.valorapostado - user.valorganho || 0), 0),
            userMetrics: {
               totalUsers: users.length,
               activeUsers: users.filter((user: any) => user.valorapostado > 0).length,
               avgBetPerUser: users.length > 0 ? users.reduce((sum: number, user: any) => sum + (user.valorapostado || 0), 0) / users.length : 0
            },
            agentMetrics: {
               totalAgents: agents.length,
               avgUsersPerAgent: agents.length > 0 ? users.length / agents.length : 0
            },
            rtpAnalysis: {
               averageRTP: users.length > 0 ? users.reduce((sum: number, user: any) => sum + (user.rtp || 0), 0) / users.length : 0,
               highRTPUsers: users.filter((user: any) => user.rtp > 95).length,
               lowRTPUsers: users.filter((user: any) => user.rtp < 85).length
            }
         }

         res.json({
            success: true,
            data: report
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao gerar relatório financeiro"
         })
      }
   },

   async getGameReport(req: Request, res: Response) {
      try {
         // Relatório de jogos mais populares baseado em calls
         const gameCalls = await allfunctions.getGameCallsStats()

         const gameNames: { [key: string]: string } = {
            "fortune-tiger": "Fortune Tiger",
            "fortune-ox": "Fortune Ox", 
            "fortune-dragon": "Fortune Dragon",
            "fortune-rabbit": "Fortune Rabbit",
            "fortune-mouse": "Fortune Mouse",
            "bikini-paradise": "Bikini Paradise",
            "jungle-delight": "Jungle Delight",
            "ganesha-gold": "Ganesha Gold",
            "double-fortune": "Double Fortune",
            "dragon-tiger-luck": "Dragon Tiger Luck"
         }

         const gameReport = gameCalls.map((game: any) => ({
            gameCode: game.gamecode,
            gameName: gameNames[game.gamecode] || game.gamecode,
            totalCalls: parseInt(game.total_calls),
            totalAwarded: parseFloat(game.total_aw || 0),
            avgAward: parseFloat(game.avg_aw || 0)
         }))

         res.json({
            success: true,
            data: gameReport
         })

      } catch (error) {
         logger.error(error)
         res.status(500).json({
            success: false,
            message: "Erro ao gerar relatório de jogos"
         })
      }
   }
}