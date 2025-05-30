import { Home, TrendingUp, Library, History, X } from "lucide-react";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ open = false, onClose }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: TrendingUp, label: "Trending" },
    { icon: Library, label: "Library" },
    { icon: History, label: "History" },
  ];

  return (
    <>
      {/* Overlay for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-gray-800 p-4 transform transition-transform duration-200 md:static md:translate-x-0 md:block
          ${open ? "translate-x-0" : "-translate-x-full"} md:min-h-screen`}
        style={{ maxWidth: 280 }}
      >
        {/* Close button for mobile */}
        {open && onClose && (
          <button
            className="absolute top-3 right-3 md:hidden text-gray-400 hover:text-white"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        <nav className="space-y-2 mt-12 md:mt-0">
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
    </>
  );
};

export default Sidebar;
