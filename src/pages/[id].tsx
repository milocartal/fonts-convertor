/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import axios from "axios";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";

import { api } from "~/utils/api";
import { type FontVariantList, type FontVariant } from "~/utils/type";

export const getServerSideProps: GetServerSideProps<{
  variants: FontVariant[];
}> = async function (context) {
  if (!context.query.id) {
    return {
      props: {
        variants: [],
      },
    };
  }

  const tempName = context.query.id as string;
  const temps = await axios.get(
    `https://fonts.google.com/download/list?family=${tempName.trim().replace(" ", "%20")}`,
    {
      method: "GET",
      headers: { accept: "application/json" },
    },
  );
  const fonts: string = temps.data;
  const obj: FontVariantList = JSON.parse(fonts.slice(5));
  return {
    props: {
      variants: JSON.parse(
        JSON.stringify(obj.manifest.fileRefs),
      ) as FontVariant[],
    },
  };
};

const Font: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ variants }) => {
  const params = useParams();
  if (!params?.id) return "Pas de font trouve";

  const convert = api.font.convertFont2.useMutation();
  const deleteFont = api.font.deleteFontFile.useMutation();

  async function convertFont(filename: string, url: string) {
    try {
      const result = await convert.mutateAsync({ filename, url });
      console.log("result", result);
      const downloadUrl = result; // Assurez-vous que `result` est l'URL du fichier à télécharger

      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const downloadElement = document.createElement("a");
      downloadElement.href = downloadUrl.path as string;
      downloadElement.setAttribute(
        "download",
        filename.replace(".ttf", ".woff2"),
      ); // Utilisez 'download' pour suggérer un nom de fichier
      document.body.appendChild(downloadElement); // Ajouter à la page pour que le clic soit possible
      downloadElement.click(); // Simuler un clic pour déclencher le téléchargement
      document.body.removeChild(downloadElement); // Nettoyer en enlevant l'élément de la page

      await deleteFont.mutateAsync({ filePath: downloadUrl.path as string });
    } catch (error) {
      console.error(
        "Erreur lors de la conversion ou du téléchargement du fichier :",
        error,
      );
    }
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1 className="text-3xl text-white">{params.id ?? "Font Name"}</h1>

        {/* variants?.map((variant) => (
          <Link
            href={variant.url}
            key={variant.filename}
            className="text-2xl text-white"
          >
            {variant.filename}
          </Link>
        )) */}

        {variants?.map((variant) => (
          <button
            onClick={() => convertFont(variant.filename, variant.url)}
            key={variant.filename}
            className="text-2xl text-white"
          >
            {variant.filename}
          </button>
        ))}
      </main>
    </>
  );
};

export default Font;
