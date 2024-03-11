import Image from "next/image";

import {
  Command,
  CommandEmpty,
  CommandGroup,
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

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 86400 });

export const getServerSideProps: GetServerSideProps<{
  fontList: FontList;
}> = async function () {
  const cacheKey = "fontList";

  let fontList: FontList | undefined = cache.get(cacheKey);

  if (!fontList) {
    const temp = await fetch(`https://fonts.google.com/metadata/fonts`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!temp.ok) {
      throw new Error(`API request failed with status ${temp.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fontList = await temp.json();

    cache.set(cacheKey, fontList);
  }
  return {
    props: {
      fontList: JSON.parse(JSON.stringify(fontList)) as FontList,
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
        src="/woffwoff2.webp"
        alt="Logo Font Convertor"
        width={350}
        height={300}
      />
      <Command className="w-1/3">
        <CommandList>
          <CommandInput placeholder="Cherchez une police" />

          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {fontList?.familyMetadataList.map((font, i) => (
              <CommandItem
                key={i}
                onSelect={() =>
                  router.push(`/${font.family.replace(" ", "%20")}`)
                }
              >
                {font.family}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </main>
  );
};

export default Home;
