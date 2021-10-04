import { Response, Request, NextFunction } from "express";
import Token from "../classes/token";

export const verificaToken = (req: any, resp: Response, next: NextFunction) => {
  const userToken = req.get("x-token") || "";

  Token.comprobarToken(userToken)
    .then((decoded: any) => {
      console.log("Decoded", decoded);
      req.usuario = decoded.usuario;
      next();
    })
    .catch((err) => {
      resp.json({
        ok: false,
        mensaje: "Token no es correcto",
      });
    });
};
