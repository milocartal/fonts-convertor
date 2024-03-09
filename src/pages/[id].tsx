/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import axios from "axios";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";

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

  const convert = api.font.convertFont.useMutation();
  const deleteFont = api.font.deleteFontFile.useMutation();

  async function convertFont(filename: string, url: string) {
    try {
      const downloadUrl = await convert.mutateAsync({ filename, url });

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
    <main className="flex min-h-screen items-center justify-center gap-24">
      <Link href="/">
        <Image
          src="/logo.webp"
          alt="Logo Font Convertor"
          width={200}
          height={200}
        />
      </Link>
      <section className="flex flex-col items-center justify-center gap-10">
        <h1 className="text-3xl">
          Variant(s) disponible(s) pour <i>{params.id ?? "Font Name"}</i>
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {variants?.map((variant) => (
            <Button
              variant={"default"}
              onClick={() => convertFont(variant.filename, variant.url)}
              key={variant.filename}
            >
              {variant.filename.replace(".ttf", ".woff2")}
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Font;
