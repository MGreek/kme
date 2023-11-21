package academic.kme.controller.Graphics;

import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;

import java.util.List;

public class CanvasArtist implements Artist {
    private static final double width = 210;
    private static final double height = 279;
    private static final double ratio = width / height;

    private Canvas canvas;

    public CanvasArtist()
    { }

    private double getScale() { return canvas.getHeight() / 297; }

    private double getCanvasSpace(double coordinate) { return coordinate * getScale(); }

    private void DrawLine(double x, double y, double lineHeight, double lineLength, GraphicsContext gc) {
        double pixelX = getCanvasSpace(x);
        double pixelY = getCanvasSpace(y);
        double pixelLineHeight = getCanvasSpace(lineHeight);
        double pixelLineLength = getCanvasSpace(lineLength);
        gc.setFill(Color.BLACK);
        gc.fillRect(pixelX, pixelY, pixelLineLength, pixelLineHeight);
    }

    public Canvas getCanvas() { return canvas; }
    public void setSize(double height) { canvas = new Canvas(ratio * height, height); }

    @Override
    public void DrawStaffLines(double x, double y, double lineHeight, double spaceHeight, double lineLength) {
        GraphicsContext gc = canvas.getGraphicsContext2D();

        for (int i = 0; i < 5; ++i) {
            DrawLine(x, y, lineHeight, lineLength, gc);
            y += lineHeight + spaceHeight;
        }
    }

    @Override
    public void DrawTrebleClef(int staffIndex, int lineOffset, double position) {
    }

    @Override
    public void DrawAltoClef(int staffIndex, int lineOffset, double position) {

    }

    @Override
    public void DrawBassClef(int staffIndex, int lineOffset, double position) {

    }

    @Override
    public void DrawTimeSignature(int count, int length, double position) {

    }

    @Override
    public void DrawAccidental(int staffIndex, int lineOffset, int accidental, double position) {

    }

    @Override
    public void DrawNoteCluster(int staffIndex, List<Integer> lines, byte length, boolean upsideDown, double position) {

    }

    @Override
    public void DrawConnectedNoteClusters(int[] staffIndex, List<Integer>[] lines, byte[] length, boolean upsideDown, double[] position) {

    }
}
