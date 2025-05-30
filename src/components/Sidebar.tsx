
import { Home, TrendingUp, Library, History } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: TrendingUp, label: "Trending" },
    { icon: Library, label: "Library" },
    { icon: History, label: "History" },
  ];

  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                item.active
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
