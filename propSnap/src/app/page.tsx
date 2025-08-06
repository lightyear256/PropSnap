import { SearchBox } from './components/SearchBox';

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col mt-25 items-center justify-start gap-y-5 p-10 bg-white">
      <div className="text-5xl text-teal-700 font-mono font-bold">Welcome To Propsnap,</div>
      <div className="text-2xl text-teal-700/75 font-mono"> Explore listings, book visits, and seal the deal—all in one place.</div>
      <div className="flex flex-col">
      <div className="flex">
      <SearchBox/>
      </div>
      </div>
    </div>
  );
}
