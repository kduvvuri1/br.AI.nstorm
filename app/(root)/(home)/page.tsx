import MeetingTypeList from '@/components/MeetingTypeList';

import backgroundImage from '@/public/images/hero-background.png';
import Image from 'next/image';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] overflow-hidden bg-hero  lg:px-10 border-b border-white hover:border-cyan-400/30 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_-3px_rgba(34,211,238,0.5)]">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base lg:text-xl font-extrabold text-black">
            Next Meeting at: 12:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-8xl text-black">{time}</h1>
            <p className="text-lg font-bold text-sky-1 lg:text-4xl text-black">{date}</p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;