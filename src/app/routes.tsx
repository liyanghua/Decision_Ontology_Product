import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { OperatorHome } from "./pages/OperatorHome";
import { TodayCommand } from "./pages/TodayCommand";
import { ProductActionBoard } from "./pages/ProductActionBoard";
import { ProductDiagnosisDetail } from "./pages/ProductDiagnosisDetail";
import { ApprovalCenter } from "./pages/ApprovalCenter";
import { ExecutionOutcome } from "./pages/ExecutionOutcome";
import { ReplayExplain } from "./pages/ReplayExplain";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: OperatorHome },
      { path: "today", Component: TodayCommand },
      { path: "products", Component: ProductActionBoard },
      { path: "products/:productId", Component: ProductDiagnosisDetail },
      { path: "approvals", Component: ApprovalCenter },
      { path: "execution", Component: ExecutionOutcome },
      { path: "replay", Component: ReplayExplain },
    ],
  },
]);