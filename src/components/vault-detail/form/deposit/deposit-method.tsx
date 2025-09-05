const methodMap = {
  dual: {
    label: "DUAL TOKEN",
    color: "bg-[#A9FF52]",
  },
  single: {
    label: "SINGLE TOKEN",
    color: "bg-[#52DCFF]",
  },
};

export const DepositMethod = ({ method }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-base font-sans text-[#9CA3AF] max-md:text-sm">
        Deposit Method
      </div>
      <div
        className={`text-[#0A080E] font-bold text-sm py-[2px] px-2 rounded-[40px] justify-start max-md:text-xs ${methodMap[method].color}`}
      >
        {methodMap[method].label}
      </div>
    </div>
  );
};
