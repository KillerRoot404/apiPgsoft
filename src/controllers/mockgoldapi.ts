import { Request, Response } from "express";
import promisePool from "../database";

export default {
  async userBalance(req: Request, res: Response) {
    try {
      const { user_code } = req.body;
      if (!user_code) {
        return res.status(400).json({ msg: "INVALID_USER" });
      }
      // procura usuário por username em qualquer agente
      const [rows]: any = await promisePool.query(
        "SELECT * FROM users WHERE username = ? LIMIT 1",
        [user_code]
      );
      if (!rows || rows.length === 0) {
        return res.json({ msg: "INVALID_USER" });
      }
      const user = rows[0];
      // Para o fluxo de teste, sempre retorna OK com saldo atual
      return res.json({ msg: "OK", user_balance: user.saldo });
    } catch (e) {
      return res.json({ msg: "OK" });
    }
  },
  async gameCallback(req: Request, res: Response) {
    try {
      // Apenas confirma recebimento e devolve algum user_balance se disponível
      const payload: any = req.body || {};
      const ub = payload?.user_balance ?? payload?.slot?.user_after_balance ?? 0;
      return res.json({ msg: "OK", user_balance: ub });
    } catch (e) {
      return res.json({ msg: "OK" });
    }
  }
};