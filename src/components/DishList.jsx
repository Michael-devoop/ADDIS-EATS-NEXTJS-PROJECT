import { getDishes } from "@/data/menuData";
import MenuGrid from "@/components/MenuGrid";

export default async function DishList({ dishes }) {
  // Uses prepared data from page.js Server Component or fetches on server
  const data = dishes || (await getDishes());

  return <MenuGrid dishes={data} />;
}
