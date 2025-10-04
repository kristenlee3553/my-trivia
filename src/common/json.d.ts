import type { Game } from "./types";

declare module "*.json" {
  const value: Game;
  export default value;
}
