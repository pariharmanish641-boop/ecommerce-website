export type SampleProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  stock: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  badge: string;
  isFeatured: boolean;
};

export const sampleProducts: SampleProduct[] = [
  {
    _id: "sample-linen-shirt",
    title: "The Sunday Linen Shirt",
    description: "Easy, airy linen for the long way home and everywhere after.",
    price: 1890,
    category: "Clothing",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 18,
    rating: 4.9,
    ratingCount: 128,
    tags: ["linen", "summer", "everyday"],
    badge: "Bestseller",
    isFeatured: true,
  },
  {
    _id: "sample-leather-tote",
    title: "Everyday Leather Tote",
    description: "A beautifully roomy carryall, made to get better with time.",
    price: 3290,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 9,
    rating: 4.8,
    ratingCount: 86,
    tags: ["bag", "leather", "everyday"],
    badge: "Local favourite",
    isFeatured: true,
  },
  {
    _id: "sample-ceramic-set",
    title: "Little Rituals Ceramic Set",
    description: "Hand-finished stoneware for slow mornings and second cups.",
    price: 1450,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 12,
    rating: 4.7,
    ratingCount: 54,
    tags: ["ceramic", "home", "handmade"],
    badge: "Handmade",
    isFeatured: true,
  },
  {
    _id: "sample-sneakers",
    title: "City Pace Everyday Sneakers",
    description: "Soft cushioning meets a clean, goes-with-everything silhouette.",
    price: 2790,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 7,
    rating: 4.8,
    ratingCount: 103,
    tags: ["sneakers", "walking", "everyday"],
    badge: "Almost gone",
    isFeatured: true,
  },
  {
    _id: "sample-table-lamp",
    title: "Soft Glow Table Lamp",
    description: "A warm little pool of light for your bedside or reading nook.",
    price: 2190,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 15,
    rating: 4.6,
    ratingCount: 42,
    tags: ["lighting", "home", "decor"],
    badge: "New",
    isFeatured: true,
  },
  {
    _id: "sample-crossbody",
    title: "The On-the-Go Crossbody",
    description: "Your hands-free daily companion with room for all the small things.",
    price: 1690,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 21,
    rating: 4.7,
    ratingCount: 67,
    tags: ["bag", "travel", "everyday"],
    badge: "Community pick",
    isFeatured: true,
  },
  {
    _id: "sample-knitwear",
    title: "Weekend Cotton Knit",
    description: "A soft, relaxed layer for cooler evenings and unhurried plans.",
    price: 2390,
    category: "Clothing",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 11,
    rating: 4.9,
    ratingCount: 31,
    tags: ["knitwear", "cotton", "layer"],
    badge: "Just landed",
    isFeatured: true,
  },
  {
    _id: "sample-watch",
    title: "Everyday Minimal Watch",
    description: "A considered finishing touch with a clean, timeless face.",
    price: 3990,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    ],
    stock: 5,
    rating: 4.8,
    ratingCount: 29,
    tags: ["watch", "minimal", "gift"],
    badge: "Limited",
    isFeatured: true,
  },
];
