import Header from "./components/Header";
import ArticleFeed from "./components/ArticleFeed";
import BreakingBanner from "./components/BreakingBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <BreakingBanner />
      <Header />
      <ArticleFeed />
    </div>
  );
}
