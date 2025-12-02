import { Outlet } from "react-router-dom";

export default function RequestsPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <Outlet />
    </div>
  );
}
