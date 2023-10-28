package academic.kme.controllers.Graphics;

import academic.kme.model.Document;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class GraphicsController {
    private Document document;
    public byte[] GetPDFBytes() throws IOException {
        PDDocument document = new PDDocument();

        // Create a new page
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        document.save(byteArrayOutputStream);
        document.close();
        return byteArrayOutputStream.toByteArray();
    }
}
