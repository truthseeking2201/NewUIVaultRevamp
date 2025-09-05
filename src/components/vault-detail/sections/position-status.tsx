import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { PERIOD_TABS } from "@/components/vault-detail/constant";
import UserPosition from "../charts/user-position";

const PositionStatus = () => {
  const [positionPeriodTab, setPositionPeriodTab] = useState("ONE_DAY");

  return (
    <DetailWrapper
      title="Your Position Status"
      titleComponent={
        <div>
          <Tabs
            value={positionPeriodTab}
            onValueChange={(value) => setPositionPeriodTab(value)}
          >
            <TabsList className="p-1 flex gap-1">
              {PERIOD_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      }
    >
      <UserPosition period={positionPeriodTab} />
    </DetailWrapper>
  );
};

export default PositionStatus;
