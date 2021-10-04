import { Router, Response, Request } from "express";
import { verificaToken } from "../middlewares/autenticacion";
import { Post } from "../models/post.model";
import { FileUpload } from "../interfaces/file-upload";
import FileSystem from "../classes/file-system";

const postRoutes = Router();
const fileSystem = new FileSystem();

// Obtener POST paginado
postRoutes.get("/", async (req: any, resp: Response) => {
  let pagina = Number(req.query.pagina) || 1;
  let skip = pagina - 1;
  skip = skip * 10;

  const posts = await Post.find()
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
});

// Crear POST
postRoutes.post("/", [verificaToken], (req: any, resp: Response) => {
  const body = req.body;

  body.usuario = req.usuario._id;

  const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);

  body.imgs = imagenes;

  Post.create(body)
    .then(async (postDB) => {
      await postDB.populate("usuario", "-password");

      resp.json({
        ok: true,
        post: postDB,
      });
    })
    .catch((err) => {
      resp.json(err);
    });
});

// Servicio para subir archivos
postRoutes.post(
  "/upload",
  [verificaToken],
  async (req: any, resp: Response) => {
    if (!req.files) {
      return resp.status(400).json({
        ok: false,
        mensaje: "No se subió ningún archivo",
      });
    }

    const file: FileUpload = req.files.image;
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

    await fileSystem.guardarImagenTemporal(file, req.usuario._id);

    resp.json({
      ok: true,
      file: file.mimetype,
    });
  }
);

postRoutes.get("/imagen/:userid/:img", (req: any, resp: Response) => {
  const userId = req.params.userid;
  const img = req.params.img;

  const pathFoto = fileSystem.getFotoUrl(userId, img);

  resp.sendFile(pathFoto) ;
});

export default postRoutes;
