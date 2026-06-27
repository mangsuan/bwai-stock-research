import ResearchClient from "./ResearchClient";

export function generateStaticParams() {
  return [
    { ticker: "AAPL" }, { ticker: "TSLA" }, { ticker: "NVDA" }, { ticker: "GOOGL" }, { ticker: "MSFT" },
    { ticker: "AMZN" }, { ticker: "META" }, { ticker: "JPM" }, { ticker: "V" }, { ticker: "MA" },
    { ticker: "WMT" }, { ticker: "PG" }, { ticker: "JNJ" }, { ticker: "UNH" }, { ticker: "HD" },
    { ticker: "DIS" }, { ticker: "BAC" }, { ticker: "XOM" }, { ticker: "KO" }, { ticker: "NFLX" },
    { ticker: "AMD" }, { ticker: "INTC" }, { ticker: "CRM" }, { ticker: "PYPL" }, { ticker: "NKE" },
    { ticker: "MCD" }, { ticker: "SBUX" }, { ticker: "BA" }, { ticker: "GS" }, { ticker: "IBM" },
    { ticker: "TSM" }, { ticker: "AVGO" }, { ticker: "COST" }, { ticker: "ABBV" }, { ticker: "PEP" },
    { ticker: "TMO" }, { ticker: "LIN" }, { ticker: "SAP" }, { ticker: "NVO" }, { ticker: "ASML" },
  ];
}

export default function ResearchPage() {
  return <ResearchClient />;
}
