import { SearchBox } from './components/SearchBox';

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-y-3 sm:gap-y-4 md:gap-y-5 p-4 sm:p-6 md:p-8 lg:p-10 bg-white pt-8 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-25 mt-25">
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-teal-700 font-mono font-bold text-center px-2">
        Welcome To Propsnap,
      </div>
      <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-teal-700/75 font-mono text-center px-4 max-w-4xl">
        Explore listings, book visits, and seal the deal—all in one place.
      </div>
      <div className="flex flex-col w-full max-w-4xl">
        <SearchBox/>
      </div>
    </div>
  );
}