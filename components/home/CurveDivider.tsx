"use client";

export default function CurveDivider() {
  return (
    <div className="relative w-full overflow-hidden z-30" style={{ marginTop: '-0.5px' }}>
      {/* Desktop Curve */}
      <div className="hidden md:block w-full h-[120px] lg:h-[160px]">
        <svg
          viewBox="0 0 1941 386"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <path
            d="M970.5 23.2567C1506.49 23.2567 1941 175.244 1941 362.744V0.000159557L6.29425e-05 0.000159557V362.744C6.29425e-05 175.244 434.509 23.2567 970.5 23.2567Z"
            className="fill-[#E0D5D0] dark:fill-[#E0D5D0] transition-colors duration-300"
          />
        </svg>
      </div>

      {/* Mobile Curve */}
      <div className="block md:hidden w-full h-[60px] sm:h-[80px]">
        <svg
          viewBox="0 0 1941 386"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <path
            d="M970.5 23.2567C1506.49 23.2567 1941 175.244 1941 362.744V0.000159557L6.29425e-05 0.000159557V362.744C6.29425e-05 175.244 434.509 23.2567 970.5 23.2567Z"
            className="fill-[#231F20] dark:fill-white transition-colors duration-300"
          />
        </svg>
      </div>
    </div>
  );
}
