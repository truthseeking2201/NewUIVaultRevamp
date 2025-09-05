import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import Form from "../form";

const DepositWithdraw = ({
  vault_id,
  isDetailLoading,
}: {
  vault_id: string;
  isDetailLoading?: boolean;
}) => {
  return (
    <DetailWrapper
      title="Manage Liquidity"
      isLoading={isDetailLoading}
      loadingStyle="h-[520px] w-full"
    >
      <Form vault_id={vault_id} />
    </DetailWrapper>
  );
};

export default DepositWithdraw;
