package academic.kme.controller;

import academic.kme.controller.Graphics.GraphicsController;
import javafx.fxml.FXML;
import javafx.scene.layout.AnchorPane;

public class MainController {
    @FXML
    private AnchorPane upperAnchorPane;
    private final GraphicsController graphicsController = new GraphicsController();

    public void UpdateUpperAnchorPane() {
    }

    public GraphicsController getGraphicsController() {
        return graphicsController;
    }
}
