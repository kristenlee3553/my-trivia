import { Button, Slider, Typography, useTheme } from "@mui/material";
import type { Drawing } from "../../../common/types";
import styles from "./index.module.css";
import CanvasDraw from "react-canvas-draw";
import { useRef, useState } from "react";

type DrawAnswerProps = {
  promptText?: string;
  onSubmit: (answer: Drawing["correctAnswer"]) => void;
};

export default function DrawOptionPlayer({ onSubmit }: DrawAnswerProps) {
  const theme = useTheme();
  const canvasRef = useRef<CanvasDraw>(null);
  const [brushColor, setBrushColor] = useState("#FFD27D");
  const [brushSize, setBrushSize] = useState(4);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [data, setData] = useState<string>("");

  const handleCanvasChange = () => {
    if (!canvasRef.current) return;
    const rawData = canvasRef.current.getSaveData();
    setData(rawData);
    const data = JSON.parse(rawData);
    setIsEmpty(data.lines.length === 0);
  };

  const brushColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.text.primary,
    theme.palette.error.main,
    theme.palette.text.disabled,
  ];

  return (
    <div className={styles.drawContainer}>
      <div className={styles.toolContainer}>
        <div className={`${styles.toolRow} ${styles.brushColorRow}`}>
          {brushColors.map((color) => (
            <div
              key={color}
              onClick={() => setBrushColor(color)}
              className={styles.brushColor}
              style={{
                backgroundColor: color,
                outline:
                  brushColor === color
                    ? "3px solid white"
                    : "2px solid transparent",
              }}
            />
          ))}
        </div>
        <div className={`${styles.toolRow} ${styles.brushSizeRow}`}>
          <Typography>Brush Size</Typography>
          <Slider
            value={brushSize}
            min={1}
            max={25}
            onChange={(_e, newValue) => setBrushSize(newValue as number)}
            sx={{ flex: 1, color: brushColor }}
          />

          <div className={styles.previewCircleContainer}>
            <div
              className={styles.circle}
              style={{
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                backgroundColor: brushColor,
              }}
            />
          </div>
        </div>
        <div className={styles.toolRow}>
          <Button variant="cancel" onClick={() => canvasRef.current?.undo()}>
            Undo
          </Button>
          <Button variant="cancel" onClick={() => canvasRef.current?.clear()}>
            Clear
          </Button>
        </div>
      </div>

      <CanvasDraw
        ref={canvasRef}
        brushColor={brushColor}
        brushRadius={brushSize}
        canvasWidth={350}
        canvasHeight={400}
        backgroundColor="#fff"
        lazyRadius={0}
        loadTimeOffset={0}
        onChange={handleCanvasChange}
        clampLinesToDocument
        hideGrid
      />
      <Button
        variant="secondary"
        onClick={() => onSubmit(data)}
        disabled={isEmpty}
      >
        Lock in
      </Button>
    </div>
  );
}

export function DrawOptionHost() {
  return (
    <div className={styles.drawContainer}>
      <Typography className={styles.hostPlaceholder}>
        Perhaps there will be nice UI here in the future...
      </Typography>
    </div>
  );
}
