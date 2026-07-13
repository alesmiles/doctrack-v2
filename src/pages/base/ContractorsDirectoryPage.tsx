import { CompanyDirectoryView } from "@/components/base/CompanyDirectoryView";
import { BASE_CONTRACTORS } from "@/mocks/baseContractors";

export function ContractorsDirectoryPage() {
  return (
    <CompanyDirectoryView
      pageTitle="Подрядчики"
      initialRecords={BASE_CONTRACTORS}
      thirdFieldKey="serviceDirection"
      thirdFieldLabel="Направление услуг"
      newRecordLabel="Новый подрядчик"
    />
  );
}

export default ContractorsDirectoryPage;
