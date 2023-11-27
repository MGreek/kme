package academic.kme.controller.Graphics;

import academic.kme.controller.Graphics.Primitive.*;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CanvasArtist implements Artist {
    private static final double width = 210;
    private static final double height = 279;
    private static final double ratio = width / height;

    private final Canvas canvas = new Canvas();

    private double getScale() { return canvas.getHeight() / height; }

    private double getCanvasSpace(double units) { return units * getScale(); }

    private void drawLine(double x, double y, double lineHeight, double lineLength, GraphicsContext gc) {
        double pixelX = getCanvasSpace(x);
        double pixelY = getCanvasSpace(y);
        double pixelLineHeight = getCanvasSpace(lineHeight);
        double pixelLineLength = getCanvasSpace(lineLength);
        gc.setFill(Color.BLACK);
        gc.fillRect(pixelX, pixelY, pixelLineLength, pixelLineHeight);
    }

    private void drawNoteHead(double x, double y, double fillPercentage, double width, GraphicsContext gc) {
        final double ratio = 1.35;
        double pixelX = getCanvasSpace(x);
        double pixelY = getCanvasSpace(y);
        double pixelWidth = getCanvasSpace(width);
        double pixelHeight = pixelWidth / ratio;
        double pixelInnerWidth = pixelWidth * (1.0 - fillPercentage);
        double pixelInnerHeight = pixelHeight * (1.0 - fillPercentage);
        double stroke = (pixelWidth - pixelInnerWidth) / 2;
        double pixelMiddleWidth = pixelInnerWidth + (stroke / 2);
        double pixelMiddleHeight = pixelInnerHeight + (stroke / 2);
        gc.setLineWidth(stroke);
        gc.setStroke(Color.BLACK);
        gc.strokeOval(pixelX - (pixelMiddleWidth / 2), pixelY - (pixelMiddleHeight / 2), pixelMiddleWidth, pixelMiddleHeight);
    }

    public void setWidth(double width) { canvas.setWidth(width); canvas.setHeight(width / ratio); }
    public void setHeight(double height) { canvas.setWidth(height * ratio); canvas.setHeight(height); }

    @Override
    public void clear() {
        GraphicsContext gc = canvas.getGraphicsContext2D();
        gc.setFill(Color.WHITE);
        gc.fillRect(0, 0, canvas.getWidth(), canvas.getHeight());
    }

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
    public void drawClef(Clef clef) {

    }

    @Override
    public void drawTimeSignature(TimeSignature timeSignature) {
    }

    @Override
    public void drawAccidental(Accidental accidental) {

    }

    @Override
    public void drawNoteStems(List<NoteStem> noteStems) {

    }
}
