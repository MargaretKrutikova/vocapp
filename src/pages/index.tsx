import type { NextPage } from "next";
import Head from "next/head";

type TechnologyCardProps = {
  name: string;
  description: string;
  link: string;
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Voc App</title>
        <meta
          name="description"
          content="A simple app for learning words and phrases"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          <span className="text-purple-300">Voc</span> App
        </h1>
        <p className="text-2xl text-gray-700">Test URLs:</p>
        <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3">
          <TechnologyCard name="test" description="Test" link="test/words" />
          <TechnologyCard name="test2" description="Test2" link="test2/words" />
        </div>
      </main>
    </>
  );
};

const TechnologyCard = ({ name, description, link }: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <a
        className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
        href={link}
      >
        Go to {name}
      </a>
    </section>
  );
};

export default Home;
