import { EXCHANGE_CODES_MAP } from "@/config/vault-config";

export const ModalVaultInfo = ({
  poolName,
  valutName,
  exchangeId,
}: {
  poolName: string;
  valutName: string;
  exchangeId: number;
}) => {
  const token1 = poolName.split("-")[0];
  const token2 = poolName.split("-")[1];
  const dex = EXCHANGE_CODES_MAP[exchangeId] || null;

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-13px md:text-base text-[#9CA3AF]">Vault</span>
        <div className="flex items-center gap-2">
          <div className="relative flex">
            <img
              src={`/coins/${token1?.toLowerCase()}.png`}
              alt={token1}
              className=" absolute right-[18px] z-0"
            />
            <img
              src={`/coins/${token2?.toLowerCase()}.png`}
              alt={token2}
              className="w-6 h-6 z-10"
            />
          </div>

          <span className="font-mono text-sm md:text-lg text-white truncate max-w-[300px] max-md:max-w-[160px]">
            {valutName}
          </span>
        </div>
      </div>
      {dex && (
        <div className="flex items-center justify-between">
          <span className="text-13px md:text-base text-[#9CA3AF]">DEX</span>
          <div className="flex items-center gap-1">
            <img src={dex.image} alt={dex.name} className=" w-4 h-4 inline" />
            <span className="font-sans text-sm md:text-base font-bold text-white">
              {dex.name}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalVaultInfo;
