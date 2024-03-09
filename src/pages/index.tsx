import Link from "next/link";
import Image from "next/image";

import { api } from "~/utils/api";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { type NextPage } from "next";

const Home: NextPage = () => {
  const { data: fontList } = api.font.getAll.useQuery();

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
            <CommandItem key={i} asChild>
              <Link href={`/${font.family}`}>{font.family}</Link>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </main>
  );
};

export default Home;
