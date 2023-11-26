package academic.kme.controller.Graphics;

import academic.kme.model.Document.Document;
import javafx.scene.canvas.Canvas;

public class GraphicsController {
    private final CanvasArtist artist = new CanvasArtist();
    private final Architect architect = new Architect(null, artist);

    public void resizeWidth(double width) {
        artist.setWidth(width);
    }
    public void resizeHeight(double height) {
        artist.setHeight(height);
    }

    public void drawCanvas() {
        architect.Draw();
    }

    public Canvas getCanvas() {
        return artist.getCanvas();
    }

    public Document getDocument() {
        return architect.getDocument();
    }

    public void setDocument(Document document) {
        architect.setDocument(document);
    }
}
