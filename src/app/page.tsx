import Header from "./components/Header";
import ArticleFeed from "./components/ArticleFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ArticleFeed />
    </div>
  );
}
