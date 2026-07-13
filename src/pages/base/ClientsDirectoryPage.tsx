import { CompanyDirectoryView } from "@/components/base/CompanyDirectoryView";
import { BASE_CLIENTS } from "@/mocks/baseClients";

export function ClientsDirectoryPage() {
  return (
    <CompanyDirectoryView
      pageTitle="Клиенты"
      initialRecords={BASE_CLIENTS}
      thirdFieldKey="edoSystem"
      thirdFieldLabel="ЭДО-система"
      newRecordLabel="Новый клиент"
    />
  );
}

export default ClientsDirectoryPage;
