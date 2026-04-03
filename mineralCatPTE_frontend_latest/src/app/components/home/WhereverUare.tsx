import Image from "next/image";
import React from "react";
import oval from "@public/home/oval.png";
import dot from "@public/home/dot.png";
import Link from "next/link";
const WhereverUare = () => {
  return (
    <div className="bg-linear-to-r  min-h-[580px] from-[#A52B1A]  to-[#EF5634] text-white relative py-5 mt-25">
      <div className="absolute top-0 hidden xl:block h-full">
        <Image src={oval} height={100} width={133} alt="" />
      </div>
      <div className="absolute hidden md:block h-full top-0 right-0">
        <Image src={dot} height={100} width={120} alt="" />
      </div>
      <div>
        <h1 className="font-bold text-2xl lg:text-5xl text-center pt-5">
          Here for You, Wherever You Are !
        </h1>
      </div>
      {/* icons section  */}
      <div className=" lg:flex grid gap-10 lg:justify-around mx-0 xl:mx-60  mt-10 lg:mt-30">
        <div className="flex flex-col items-center justify-center ">
          <div className="">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.4898 26.7C23.4718 26.7 26.6998 23.472 26.6998 19.49C26.6998 15.5081 23.4718 12.28 19.4898 12.28C15.5078 12.28 12.2798 15.5081 12.2798 19.49C12.2798 23.472 15.5078 26.7 19.4898 26.7Z"
                fill="white"
              />
              <path
                d="M24.6431 53.36L24.6431 39.97C24.6431 36.9078 25.8688 34.1299 27.8505 32.0894C26.6588 31.2201 25.1972 30.7 23.6131 30.7L15.3731 30.7C11.3973 30.7 8.16309 33.9342 8.16309 37.91L8.16309 46.15C8.16309 46.5403 8.38351 46.8967 8.73268 47.0718L12.3274 48.8692L13.3151 62.7041C13.3543 63.2428 13.8034 63.66 14.3431 63.66L24.6431 63.66C25.1828 63.66 25.6319 63.2428 25.671 62.7031L26.1489 56.0101C25.2384 55.4632 24.6431 54.4682 24.6431 53.36Z"
                fill="white"
              />
              <path
                d="M60.5098 26.7C64.4918 26.7 67.7198 23.472 67.7198 19.49C67.7198 15.5081 64.4918 12.28 60.5098 12.28C56.5278 12.28 53.2998 15.5081 53.2998 19.49C53.2998 23.472 56.5278 26.7 60.5098 26.7Z"
                fill="white"
              />
              <path
                d="M55.3568 53.36L55.3568 39.97C55.3568 36.9078 54.1311 34.1299 52.1494 32.0894C53.3411 31.2201 54.8027 30.7 56.3868 30.7L64.6268 30.7C68.6026 30.7 71.8368 33.9342 71.8368 37.91V46.15C71.8368 46.5403 71.6164 46.8967 71.2672 47.0718L67.6725 48.8692L66.6848 62.7041C66.6456 63.2428 66.1966 63.66 65.6568 63.66H55.3568C54.8171 63.66 54.368 63.2428 54.3289 62.7031L53.851 56.0101C54.7615 55.4632 55.3568 54.4682 55.3568 53.36Z"
                fill="white"
              />
              <path
                d="M44.1199 30.6799H35.8799C30.769 30.6799 26.6099 34.8391 26.6099 39.9499L26.6099 53.3399C26.6099 53.8312 26.9559 54.2535 27.438 54.3493L31.8114 55.2238L32.7919 70.9138C32.8259 71.4566 33.276 71.8799 33.8199 71.8799H46.1799C46.7237 71.8799 47.1738 71.4566 47.2078 70.9138L48.1884 55.2248L52.5617 54.3504C53.0438 54.2535 53.3899 53.8312 53.3899 53.3399L53.3899 39.9499C53.3899 34.8391 49.2307 30.6799 44.1199 30.6799Z"
                fill="white"
              />
              <path
                d="M40 26.7099C45.1108 26.7099 49.27 22.5508 49.27 17.4399C49.27 12.3291 45.1108 8.16992 40 8.16992C34.8891 8.16992 30.73 12.3291 30.73 17.4399C30.73 22.5508 34.8891 26.7099 40 26.7099Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-2xl">Always Available</h1>
          </div>
          <div>
            <p className="text-center w-70 mt-5">
              Our team is here 24/7 to ensure your satisfaction. We value
              transparency, integrity, and the privacy of every learner.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center lg:border-l lg:border-r px-15 border-white">
          <div className="">
            <svg
              width="62"
              height="62"
              viewBox="0 0 62 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30.9 0C13.8344 0 0 13.8344 0 30.9C0 47.9656 13.8344 61.8 30.9 61.8C47.9656 61.8 61.8 47.9656 61.8 30.9C61.7852 13.8405 47.9595 0.0147657 30.9 0ZM46.041 21.321L25.441 41.921C25.253 42.1182 24.9925 42.2298 24.72 42.2298C24.4475 42.2298 24.187 42.1182 23.999 41.921L15.759 33.681C15.3676 33.2817 15.3709 32.6416 15.7662 32.2462C16.1616 31.8509 16.8017 31.8476 17.201 32.239L24.72 39.758L44.599 19.879C44.8557 19.6171 45.2333 19.5131 45.5879 19.6069C45.9425 19.7006 46.2194 19.9775 46.3131 20.3321C46.4068 20.6867 46.3029 21.0643 46.041 21.321Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-2xl mt-4">Trusted Guidance</h1>
          </div>
          <div>
            <p className="text-center w-70 mt-5">
              Our team is here 24/7 to ensure your satisfaction. We value
              transparency, integrity, and the privacy of every learner.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="">
            <svg
              width="66"
              height="56"
              viewBox="0 0 66 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M53.4137 30.8C46.5875 30.8 41.0537 36.3338 41.0537 43.16C41.0537 49.9863 46.5875 55.52 53.4137 55.52C60.24 55.52 65.7737 49.9863 65.7737 43.16C65.7737 36.3338 60.24 30.8 53.4137 30.8ZM58.5637 44.19H54.4437V48.31C54.4437 48.8789 53.9826 49.34 53.4137 49.34C52.8449 49.34 52.3837 48.8789 52.3837 48.31V44.19H48.2637C47.6949 44.19 47.2337 43.7289 47.2337 43.16C47.2337 42.5912 47.6949 42.13 48.2637 42.13H52.3837V38.01C52.3837 37.4412 52.8449 36.98 53.4137 36.98C53.9826 36.98 54.4437 37.4412 54.4437 38.01V42.13H58.5637C59.1326 42.13 59.5937 42.5912 59.5937 43.16C59.5937 43.7289 59.1326 44.19 58.5637 44.19Z"
                fill="white"
              />
              <path
                d="M38.11 43.16H24.72V39.04L1.03004 39.04C0.754501 39.0422 0.491126 39.1538 0.297932 39.3503C0.104738 39.5468 -0.00242712 39.812 4.17309e-05 40.0875C0.0153531 45.198 4.15953 49.3344 9.27004 49.34L39.4089 49.34C38.5524 47.3923 38.1101 45.2878 38.11 43.16Z"
                fill="white"
              />
              <path
                d="M57.624 6.18L57.624 28.3847C58.3268 28.5762 59.0152 28.8171 59.684 29.1057L59.684 5.15C59.684 2.30573 57.3783 0 54.534 0L11.274 0C8.42976 0 6.12402 2.30573 6.12402 5.15L6.12402 37.08H8.18402L8.18402 6.18C8.18402 5.61115 8.64517 5.15 9.21402 5.15L56.594 5.15C57.1629 5.15 57.624 5.61115 57.624 6.18Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-2xl mt-4">Innovative Platform</h1>
          </div>
          <div>
            <p className="text-center w-70 mt-5">
              Our team is here 24/7 to ensure your satisfaction. We value
              transparency, integrity, and the privacy of every learner.
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10 ">
        <Link href={"/contact-us"}>
          <button className="cursor-pointer px-16 py-3 rounded-lg text-white bg-gradient-to-b from-[#EF5634] to-[#5A0000] hover:from-[#5A0000] hover:to-[#5A0000]  text-center transition-all duration-500 ease-in-out hover:text-white inline-block">
            Contact US
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WhereverUare;

