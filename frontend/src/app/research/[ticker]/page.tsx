import ResearchClient from "./ResearchClient";

export function generateStaticParams() {
  return [
    { ticker: "AAPL" },
    { ticker: "TSLA" },
    { ticker: "NVDA" },
    { ticker: "GOOGL" },
    { ticker: "MSFT" },
  ];
}

export default function ResearchPage() {
  return <ResearchClient />;
}
