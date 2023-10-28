package academic.kme.controllers;

import academic.kme.controllers.Graphics.GraphicsController;
import com.dansoftware.pdfdisplayer.PDFDisplayer;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.layout.AnchorPane;

import java.io.ByteArrayInputStream;
import java.io.IOException;

public class MainController {
    @FXML
    private AnchorPane upperAnchorPane;
    private final GraphicsController graphicsController = new GraphicsController();
    private final PDFDisplayer display = new PDFDisplayer();
    private boolean added = false;

    public void UpdateUpperAnchorPane() {
        try {
            display.loadPDF(new ByteArrayInputStream(graphicsController.GetPDFBytes()));
        } catch (IOException e) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("PDF Display Error");
            alert.setHeaderText(null);
            alert.setContentText("Failed to update the display.");
            alert.showAndWait();
        }
        if (!added) {
            upperAnchorPane.getChildren().add(display.toNode());
            added = true;
        }
    }
}
