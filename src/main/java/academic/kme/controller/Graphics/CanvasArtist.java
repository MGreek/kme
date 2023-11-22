package academic.kme.controller.Graphics;

import academic.kme.controller.Graphics.Primitive.Note;
import academic.kme.controller.Graphics.Primitive.StaffLines;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CanvasArtist implements Artist {
    private static final double width = 210;
    private static final double height = 279;
    private static final double ratio = width / height;

    private Canvas canvas;

    private double getScale() { return canvas.getHeight() / 297; }

    private double getCanvasSpace(double coordinate) { return coordinate * getScale(); }

    private void drawLine(double x, double y, double lineHeight, double lineLength, GraphicsContext gc) {
        double pixelX = getCanvasSpace(x);
        double pixelY = getCanvasSpace(y);
        double pixelLineHeight = getCanvasSpace(lineHeight);
        double pixelLineLength = getCanvasSpace(lineLength);
        gc.setFill(Color.BLACK);
        gc.fillRect(pixelX, pixelY, pixelLineLength, pixelLineHeight);
    }

    public void setSize(double height) { canvas = new Canvas(ratio * height, height); }

    @Override
    public void drawStaffLines(StaffLines staffLines) {
        GraphicsContext gc = canvas.getGraphicsContext2D();
        double y = staffLines.getY();
        for (int i = 0; i < 5; ++i) {
            drawLine(staffLines.getX(), y, staffLines.getLineHeight(), staffLines.getLength(), gc);
            y += staffLines.getLineHeight() + staffLines.getSpaceHeight();
        }
    }

    @Override
    public void drawTrebleClef(int staffIndex, int lineOffset, double position) {
    }

    @Override
    public void drawAltoClef(int staffIndex, int lineOffset, double position) {

    }

    @Override
    public void drawBassClef(int staffIndex, int lineOffset, double position) {

    }

    @Override
    public void drawTimeSignature(int count, int length, double position) {

    }

    @Override
    public void drawAccidental(int staffIndex, int lineOffset, int accidental, double position) {

    }

    @Override
    public void drawNote(Note note) {

    }

    @Override
    public void drawNotes(List<Note> notes) {

    }
}
