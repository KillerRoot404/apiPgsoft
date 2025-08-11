import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface AuthRequest extends Request {
   user?: any
}

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
   try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({
            success: false,
            message: "Token de acesso não fornecido"
         })
      }

      const token = authHeader.substring(7) // Remove 'Bearer '
      
      const decoded = jwt.verify(token, process.env.API_SECRET || "default-secret") as any
      
      if (decoded.role !== 'admin') {
         return res.status(403).json({
            success: false,
            message: "Acesso negado. Privilégios de admin necessários."
         })
      }

      req.user = decoded
      next()

   } catch (error) {
      return res.status(401).json({
         success: false,
         message: "Token inválido ou expirado"
      })
   }
}

export default adminAuth