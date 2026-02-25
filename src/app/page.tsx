import Header from "./components/Header";
import ArticleFeed from "./components/ArticleFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ArticleFeed />
    </div>
  );
}
