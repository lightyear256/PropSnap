import { Footer } from './components/Footer';
import { SearchBox } from './components/SearchBox';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white mt-25">
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 md:pt-24 lg:pt-28 xl:pt-32 pb-8 sm:pb-12 md:pb-16">
        
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-teal-700 font-mono font-bold leading-tight px-2">
            Welcome To Propsnap
          </h1>
        </div>

        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-teal-700/75 font-mono px-4 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed">
            Explore listings, book visits, and seal the deal—all in one place.
          </p>
        </div>

        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-0">
          <SearchBox />
        </div>

      </div>

      <div className="min-h-[20vh] sm:min-h-[10vh]"></div>

      <Footer />
    </div>
  );
}