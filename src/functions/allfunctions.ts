import { RowDataPacket, ResultSetHeader } from "mysql2"
import promisePool from "../database"
import moment from "moment-timezone"

export default {
   // ===== USUÁRIOS =====
   async getuserbytoken(token: string) {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM users WHERE token= ?`, [token])
      return res[0]
   },

   async updatertp(token: string, rtp: number) {
      const res = await promisePool.query<ResultSetHeader>("UPDATE users SET rtp = ? WHERE token=?", [rtp, token])
      return res[0]
   },

   async getAllUsers() {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM users ORDER BY id DESC`)
      return res[0]
   },

   async getUsersPaginated(limit: number, offset: number) {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM users ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset])
      return res[0]
   },

   async getUsersCount() {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM users`)
      return res[0][0].total
   },

   async getUserById(id: number) {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [id])
      return res[0][0]
   },

   // ===== AGENTES =====
   async getAllAgents() {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM agents ORDER BY id DESC`)
      return res[0]
   },

   async createAgent(agentData: any) {
      const { agentCode, agentToken, secretKey, callbackurl, saldo } = agentData
      const res = await promisePool.query<ResultSetHeader>(
         "INSERT INTO agents (agentCode, agentToken, secretKey, callbackurl, saldo) VALUES (?, ?, ?, ?, ?)",
         [agentCode, agentToken, secretKey, callbackurl, saldo]
      )
      return res[0]
   },

   async updateAgent(id: number, updates: any) {
      const fields = Object.keys(updates).map(field => `${field} = ?`).join(", ")
      const values = Object.values(updates)
      values.push(id)

      const res = await promisePool.query<ResultSetHeader>(
         `UPDATE agents SET ${fields} WHERE id = ?`,
         values
      )
      return res[0]
   },

   async deleteAgent(id: number) {
      const res = await promisePool.query<ResultSetHeader>("DELETE FROM agents WHERE id = ?", [id])
      return res[0]
   },

   // ===== RELATÓRIOS =====
   async getGameCallsStats() {
      const res = await promisePool.query<RowDataPacket[]>(`
         SELECT gamecode, 
                COUNT(*) as total_calls,
                SUM(aw) as total_aw,
                AVG(aw) as avg_aw
         FROM calls 
         WHERE status = 'completed'
         GROUP BY gamecode 
         ORDER BY total_calls DESC
      `)
      return res[0]
   },

   async getRecentActivity(days: number = 7) {
      const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD')
      
      const res = await promisePool.query<RowDataPacket[]>(`
         SELECT 
            DATE(data_registro) as date,
            COUNT(*) as new_users
         FROM users 
         WHERE data_registro >= ?
         GROUP BY DATE(data_registro)
         ORDER BY date DESC
      `, [startDate])
      
      return res[0]
   },

   // ===== FUNÇÕES LEGACY PARA COMPATIBILIDADE =====
   async getagentbyid(id: number) {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM agents WHERE id = ?`, [id])
      return res[0]
   },

   async calcularganho(saldo: number, valorapostado: number, rtp: number) {
      // Lógica simplificada de cálculo de ganho baseada no RTP
      const ganho = (valorapostado * rtp) / 100
      return ganho
   },

   async getcallbyid(id: number) {
      const res = await promisePool.query<RowDataPacket[]>(`SELECT * FROM calls WHERE id = ?`, [id])
      return res[0]
   },

   async updatestepscall(id: number, steps: number) {
      const res = await promisePool.query<ResultSetHeader>("UPDATE calls SET steps = ? WHERE id = ?", [steps, id])
      return res[0]
   },

   async completecall(id: number, aw: number) {
      const res = await promisePool.query<ResultSetHeader>("UPDATE calls SET status = 'completed', aw = ? WHERE id = ?", [aw, id])
      return res[0]
   },

   async subtrairstepscall(id: number) {
      const res = await promisePool.query<ResultSetHeader>("UPDATE calls SET steps = steps - 1 WHERE id = ?", [id])
      return res[0]
   }
}