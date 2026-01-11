import YouTube, { type YouTubeEvent } from "react-youtube";
import { useEffect, useRef } from "react";

type VideoDisplayProps = {
  videoUrl: string;
  startTime?: number;
  endTime?: number;
  /** Default will loop */
  onVideoEnd?: () => void;
  className?: string;
  loopVideo?: boolean;
};

export default function VideoDisplay({
  videoUrl,
  startTime = 0,
  endTime,
  onVideoEnd,
  className,
  loopVideo = false,
}: VideoDisplayProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoId = extractVideoId(videoUrl);

  const onReady = (event: YouTubeEvent) => {
    const ytPlayer = event.target;

    ytPlayer.seekTo(startTime);
    ytPlayer.playVideo();

    // Clear any old interval before starting new one
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const current = ytPlayer.getCurrentTime();
      const limit = endTime ?? ytPlayer.getDuration();

      if (current >= limit) {
        clearInterval(intervalRef.current!);
        ytPlayer.pauseVideo();

        if (loopVideo) {
          ytPlayer.seekTo(startTime);
          ytPlayer.playVideo();
        } else {
          onVideoEnd?.();
        }
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <YouTube
      videoId={videoId ?? ""}
      opts={{
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          start: startTime,
        },
      }}
      onReady={onReady}
      className={className}
    />
  );
}

/** Extracts the YouTube video ID from any valid YouTube URL or returns the original string if it's already an ID. */
function extractVideoId(url: string): string | null {
  try {
    // If user directly provides an ID, just return it
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) return url;

    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}
