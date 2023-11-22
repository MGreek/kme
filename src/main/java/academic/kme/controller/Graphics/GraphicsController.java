package academic.kme.controller.Graphics;

import academic.kme.controller.Graphics.Primitive.StaffLines;
import academic.kme.model.Document.Document;
import javafx.scene.canvas.Canvas;

public class GraphicsController {
    private Document document;
    private final CanvasArtist artist = new CanvasArtist();

    private void Resize() {
        artist.setSize(279);
    }

    public void DrawCanvas() {
        Resize();

        artist.drawStaffLines(new StaffLines(30, 30, 2.5, 10, 200));
    }

    public Canvas getCanvas() {
        return artist.getCanvas();
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }
}
