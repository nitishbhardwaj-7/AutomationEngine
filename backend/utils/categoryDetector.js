export function detectCategory(title) {
  const lower = title.toLowerCase();

  if (lower.includes("women")) return "women";
  if (lower.includes("men")) return "men";
  

  return "unisex";
}