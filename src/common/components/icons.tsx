import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import BlenderIcon from "@mui/icons-material/Blender";
import BuildIcon from "@mui/icons-material/Build";
import CakeIcon from "@mui/icons-material/Cake";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import ChairIcon from "@mui/icons-material/Chair";
import CoffeeIcon from "@mui/icons-material/Coffee";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import CycloneIcon from "@mui/icons-material/Cyclone";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import FloodIcon from "@mui/icons-material/Flood";
import FortIcon from "@mui/icons-material/Fort";
import IceSkatingIcon from "@mui/icons-material/IceSkating";
import IcecreamIcon from "@mui/icons-material/Icecream";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import { Avatar, Tooltip, type AvatarProps } from "@mui/material";

export const AVATAR_KEYS = [
  "water",
  "musicNote",
  "blender",
  "wrench",
  "cake",
  "pokemon",
  "chair",
  "coffee",
  "palette",
  "cyclone",
  "fastFood",
  "flood",
  "fort",
  "skating",
  "iceCream",
  "noodles",
  "rocket",
  "touching",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

interface AvatarSetting {
  Icon: React.ElementType;
  color: string;
}

export const AVATAR_CONFIG: Record<AvatarKey, AvatarSetting> = {
  water: { Icon: WaterDropIcon, color: "#2196f3" },
  musicNote: { Icon: AudiotrackIcon, color: "#9c27b0" },
  blender: { Icon: BlenderIcon, color: "#9e9e9e" },
  wrench: { Icon: BuildIcon, color: "#607d8b" },
  cake: { Icon: CakeIcon, color: "#e91e63" },
  pokemon: { Icon: CatchingPokemonIcon, color: "#ff1744" },
  chair: { Icon: ChairIcon, color: "#795548" },
  coffee: { Icon: CoffeeIcon, color: "#6f4e37" },
  palette: { Icon: ColorLensIcon, color: "#ff9800" },
  cyclone: { Icon: CycloneIcon, color: "#00bcd4" },
  fastFood: { Icon: FastfoodIcon, color: "#ffc107" },
  flood: { Icon: FloodIcon, color: "#0d47a1" },
  fort: { Icon: FortIcon, color: "#455a64" },
  skating: { Icon: IceSkatingIcon, color: "#81d4fa" },
  iceCream: { Icon: IcecreamIcon, color: "#f48fb1" },
  noodles: { Icon: RamenDiningIcon, color: "#f44336" },
  rocket: { Icon: RocketLaunchIcon, color: "#ff5722" },
  touching: { Icon: SportsKabaddiIcon, color: "#4caf50" },
};

type PlayerAvatarProps = AvatarProps & {
  avatarKey: AvatarKey;
  size?: number;
  tooltip?: string;
};

export default function PlayerAvatar({
  avatarKey,
  size = 24,
  tooltip,
  ...props
}: PlayerAvatarProps) {
  const config = AVATAR_CONFIG[avatarKey];
  const Icon = config.Icon;

  const content = (
    <Avatar
      {...props}
      sx={{
        width: size,
        height: size,
        bgcolor: `${config.color}22`, // 22 adds subtle transparency to hex
        border: `2px solid ${config.color}`,
        ...props.sx,
      }}
    >
      <Icon sx={{ color: config.color, fontSize: size * 0.6 }} />
    </Avatar>
  );

  if (!tooltip) return content;

  return <Tooltip title={tooltip}>{content}</Tooltip>;
}
