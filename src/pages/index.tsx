/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

export default function Home() {
  const { data: fontList } = api.font.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {fontList?.familyMetadataList.map((font, i) => (
          <p className="text-2xl text-white" key={i}>
            {font.family}
          </p>
        ))}
      </main>
    </>
  );
}
