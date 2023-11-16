package academic.kme.controller.Graphics;

import academic.kme.model.Document.Document;

public class GraphicsController {
    private Document document;
    private Artist artist;

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }
}
