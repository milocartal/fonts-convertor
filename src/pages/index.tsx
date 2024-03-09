import Image from "next/image";

import { api } from "~/utils/api";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { useRouter } from "next/router";
import { type FontList } from "~/utils/type";

export const getServerSideProps: GetServerSideProps<{
  fontList: FontList;
}> = async function () {
  const temp = await fetch(`https://fonts.google.com/metadata/fonts`, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!temp.ok) {
    throw new Error(`API request failed with status ${temp.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const fonts: FontList = await temp.json();
  return {
    props: {
      fontList: JSON.parse(JSON.stringify(fonts)) as FontList,
    },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fontList }) => {
  //const { data: fontList } = api.font.getAll.useQuery();
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center gap-24">
      <Image
        src="/logo.webp"
        alt="Logo Font Convertor"
        width={200}
        height={200}
      />
      <Command className="w-[400px]">
        <CommandInput placeholder="Cherchez une police" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {fontList?.familyMetadataList.map((font, i) => (
            <CommandItem
              key={i}
              onSelect={() => console.log("Selected", font.family)}
            >
              {font.family}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </main>
  );
};

export default Home;
