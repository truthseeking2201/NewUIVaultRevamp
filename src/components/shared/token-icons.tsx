const TOKEN_ICONS = {};

export interface TokenIconProps {
  token: keyof typeof TOKEN_ICONS;
  size?: number;
  className?: string;
}

export function TokenIcon({ token, size = 24, className }: TokenIconProps) {
  return (
    <img
      src={TOKEN_ICONS[token]}
      alt={`${token} icon`}
      width={size}
      height={size}
      className={className}
    />
  );
}

const mapVaultIdToTokens = (
  id: string
): [TokenIconProps["token"], TokenIconProps["token"]] => {
  const parts = id.split("-");

  const tokens = parts.map((part) => {
    const upperPart = part.toUpperCase();

    if (upperPart in TOKEN_ICONS) {
      return upperPart as TokenIconProps["token"];
    }

    return "SUI" as TokenIconProps["token"];
  });

  return [tokens[0], tokens[1]] as [
    TokenIconProps["token"],
    TokenIconProps["token"]
  ];
};

export function PairIcon({
  tokens,
  size = 24,
}: {
  tokens: [TokenIconProps["token"], TokenIconProps["token"]] | string;
  size?: number;
}) {
  const tokenPair =
    typeof tokens === "string" ? mapVaultIdToTokens(tokens) : tokens;

  return (
    <div className="relative flex items-center">
      <TokenIcon token={tokenPair[0]} size={size} className="z-10" />
      <TokenIcon token={tokenPair[1]} size={size} className="-ml-3" />
    </div>
  );
}
