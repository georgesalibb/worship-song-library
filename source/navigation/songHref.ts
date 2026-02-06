import type { Href } from "expo-router";

export function songHref(id: string): Href {
  return {
    pathname: "/song/[id]",
    params: { id },
  };
}
