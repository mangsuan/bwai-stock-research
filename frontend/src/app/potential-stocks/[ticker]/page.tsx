import PotentialStockDetailClient from "./PotentialStockDetailClient";

export function generateStaticParams() {
  return [
    { ticker: "AAPL" },
    { ticker: "TSLA" },
    { ticker: "NVDA" },
    { ticker: "GOOGL" },
    { ticker: "MSFT" },
    { ticker: "AMZN" },
    { ticker: "META" },
    { ticker: "NFLX" },
    { ticker: "UTHR" },
    { ticker: "CRM" },
    { ticker: "ADBE" },
    { ticker: "INTC" },
    { ticker: "AMD" },
    { ticker: "QCOM" },
    { ticker: "AVGO" },
    { ticker: "TXN" },
    { ticker: "ORCL" },
    { ticker: "CSCO" },
    { ticker: "IBM" },
    { ticker: "SAP" },
  ];
}

export default function PotentialStockDetailPage() {
  return <PotentialStockDetailClient />;
}
