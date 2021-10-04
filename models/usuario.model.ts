import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es necesario"],
  },
  avatar: {
    type: String,
    default: "av-1.png",
  },
  email: {
    type: String,
    unique: true,
    required: [true, "El email es necesario"],
  },
  password: {
    type: String,
    required: [true, "El password es necesario"],
  },
});

usuarioSchema.method(
  "compararPassword",
  function (password: string = ""): boolean {
    if (bcrypt.compareSync(password, this.password)) {
      return true;
    } else {
      return false;
    }
  }
);

export interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
  avatar: string;

  compararPassword(password: string): boolean;
}

export const Usuario = model<IUsuario>("Usuario", usuarioSchema);
