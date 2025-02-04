import { useEffect, useState } from "react";

const useSidebar = () => {
  const [sidebarItems, setSidebarItems] = useState<string[]>([]);

  useEffect(() => {
    const onGetSidebarItems = async () => {
      //   TODO: Remove static code and get items from backend
      setSidebarItems(["All", "All-Hands Meetings", "AMA Sessions", "Product Showcase", "Nurture Sessions", "Security Session"]);
    };
    onGetSidebarItems();
  }, []);

  return { sidebarItems };
};
export default useSidebar;
