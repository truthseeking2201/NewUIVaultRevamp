const UseDesktopBanner = () => {
  return (
    <div className="bg-[#8ADDA5] h-11 w-full">
      <div className="flex items-center justify-center h-full p-2">
        <div className="pr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="18"
            viewBox="0 0 21 18"
            fill="none"
          >
            <path
              d="M6.37695 18V16H8.37695V14H2.37695C1.82695 14 1.35612 13.8042 0.964453 13.4125C0.572786 13.0208 0.376953 12.55 0.376953 12V2C0.376953 1.45 0.572786 0.979167 0.964453 0.5875C1.35612 0.195833 1.82695 0 2.37695 0H18.377C18.927 0 19.3978 0.195833 19.7895 0.5875C20.1811 0.979167 20.377 1.45 20.377 2V12C20.377 12.55 20.1811 13.0208 19.7895 13.4125C19.3978 13.8042 18.927 14 18.377 14H12.377V16H14.377V18H6.37695ZM2.37695 12H18.377V2H2.37695V12Z"
              fill="#1C1B1F"
            />
          </svg>
        </div>
        <div className="font-sans text-sm text-black pr-2 font-medium text-center">
          Use a Google Chrome Desktop for the Best Experience!
        </div>
        {/* <button
          className="flex items-center justify-center rounded-full"
          onClick={() => setCloseBanner(true)}
        >
          <X size={20} className="text-black" />
        </button> */}
      </div>
    </div>
  );
};

export default UseDesktopBanner;
