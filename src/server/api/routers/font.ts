/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import axios from "axios";
import {
  mkdirSync,
  existsSync,
  type PathLike,
  renameSync,
  unlinkSync,
} from "fs";
import path, { join } from "path";
import Fontmin from "fontmin";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type FontVariantList, type FontList } from "~/utils/type";
import { TRPCError } from "@trpc/server";

export const fontRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const temp = await fetch(`https://fonts.google.com/metadata/fonts`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!temp.ok) {
      throw new Error(`API request failed with status ${temp.status}`);
    }

    const fonts: FontList = await temp.json();
    return fonts;
  }),

  getOneQuery: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      try {
        const temps = await axios.get(
          `https://fonts.google.com/download/list?family=${input.name.trim().replace(" ", "%20")}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          },
        );
        const fonts: string = temps.data;
        const obj: FontVariantList = JSON.parse(fonts.slice(5));
        return obj.manifest.fileRefs;
      } catch (error) {
        console.log(error);
      }
    }),

  getOne: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const temps = await axios.get(
          `https://fonts.google.com/download/list?family=${input.name.trim().replace(" ", "%20")}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          },
        );
        const fonts: string = temps.data;
        const obj: FontVariantList = JSON.parse(fonts.slice(5));
        return obj.manifest.fileRefs;
      } catch (error) {
        console.log(error);
      }
    }),

  convertFont: publicProcedure
    .input(z.object({ filename: z.string(), url: z.string() }))
    .mutation(async ({ input }) => {
      const { filename, url } = input;

      // Chemin du répertoire où le fichier converti sera enregistré
      const outputPath = join(process.cwd(), "public", "fonts");
      if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true });
      }

      try {
        const response = await axios.get(url, { responseType: "arraybuffer" });

        const sourcePath = join(outputPath, filename); // Utiliser tempPath pour le travail intermédiaire
        console.log("sourcePath", sourcePath);

        // Sauvegarder le fichier temporairement
        const fontmin = new Fontmin()
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .src(response.data)
          .use(Fontmin.ttf2woff2({ clone: false }))
          .dest(outputPath);

        // Convertir le fichier en promesse pour attendre la fin de la conversion
        const conversionPromise = new Promise((resolve, reject) => {
          fontmin.run((err, files) => {
            if (err) {
              reject(err);
            } else {
              const desiredName = filename.replace(".ttf", ".woff2");
              const convertedFilePath = files[0]!.path as PathLike; // Chemin du fichier converti
              const desiredFilePath = join(outputPath, desiredName); // Chemin et nom désirés pour le fichier converti

              // Renommer et déplacer le fichier converti au chemin final
              renameSync(convertedFilePath, desiredFilePath);

              // Chemin final relatif pour le client
              const finalPath = desiredFilePath.split("public")[1];
              resolve(finalPath);
            }
          });
        });

        // Attendre la promesse de conversion
        const finalPath = await conversionPromise;
        return { path: finalPath };
      } catch (error) {
        console.error(
          "Erreur lors du téléchargement ou de la conversion:",
          error,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la conversion de la police",
        });
      }
    }),

  deleteFontFile: publicProcedure
    .input(
      z.object({
        filePath: z.string(), // Chemin du fichier à supprimer relativement au dossier 'public'
      }),
    )
    .mutation(async ({ input }) => {
      const { filePath } = input;
      // Construire le chemin absolu vers le fichier à supprimer
      const absolutePath = path.join(process.cwd(), "public", filePath);

      try {
        // Vérifier si le chemin commence bien par le dossier public pour éviter les suppressions hors de ce dossier
        if (!absolutePath.startsWith(path.join(process.cwd(), "public"))) {
          throw new Error(
            "Tentative de suppression de fichier hors du dossier public",
          );
        }

        // Supprimer le fichier
        unlinkSync(absolutePath);
        return { success: true, message: "Fichier supprimé avec succès." };
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la suppression du fichier",
        });
      }
    }),
});
