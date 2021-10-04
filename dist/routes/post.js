"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacion_1 = require("../middlewares/autenticacion");
const post_model_1 = require("../models/post.model");
const file_system_1 = __importDefault(require("../classes/file-system"));
const postRoutes = express_1.Router();
const fileSystem = new file_system_1.default();
// Obtener POST paginado
postRoutes.get("/", (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 10;
    const posts = yield post_model_1.Post.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(10)
        .populate("usuario", "-password")
        .exec();
    resp.json({
        ok: true,
        pagina,
        posts,
    });
}));
// Crear POST
postRoutes.post("/", [autenticacion_1.verificaToken], (req, resp) => {
    const body = req.body;
    body.usuario = req.usuario._id;
    const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);
    body.imgs = imagenes;
    post_model_1.Post.create(body)
        .then((postDB) => __awaiter(void 0, void 0, void 0, function* () {
        yield postDB.populate("usuario", "-password");
        resp.json({
            ok: true,
            post: postDB,
        });
    }))
        .catch((err) => {
        resp.json(err);
    });
});
// Servicio para subir archivos
postRoutes.post("/upload", [autenticacion_1.verificaToken], (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return resp.status(400).json({
            ok: false,
            mensaje: "No se subió ningún archivo",
        });
    }
    const file = req.files.image;
    // const file = req.files;
    if (!file) {
        return resp.status(400).json({
            ok: false,
            mensaje: "No se subió ningún archivo - image",
        });
    }
    if (!file.mimetype.includes("image")) {
        return resp.status(400).json({
            ok: false,
            mensaje: "Lo que se subió no es una imagen",
        });
    }
    yield fileSystem.guardarImagenTemporal(file, req.usuario._id);
    resp.json({
        ok: true,
        file: file.mimetype,
    });
}));
postRoutes.get("/imagen/:userid/:img", (req, resp) => {
    const userId = req.params.userid;
    const img = req.params.img;
    const pathFoto = fileSystem.getFotoUrl(userId, img);
    resp.sendFile(pathFoto);
});
exports.default = postRoutes;
