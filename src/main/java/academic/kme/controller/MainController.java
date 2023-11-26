package academic.kme.controller;

import academic.kme.controller.Graphics.GraphicsController;
import javafx.fxml.FXML;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.Label;
import javafx.scene.layout.Background;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public class MainController {
    @FXML
    private Pane mainPane;
    @FXML
    private Label commandLine;

    private boolean added = false;
    private final GraphicsController graphicsController = new GraphicsController();

    private void sizeChanged() {
        updateCanvas();
    }

    private void updateCanvas() {
        Canvas canvas = graphicsController.getCanvas();

        graphicsController.resizeHeight(Math.min(mainPane.getWidth(), mainPane.getHeight()));

        canvas.setLayoutX((mainPane.getWidth() - canvas.getWidth()) / 2);
        canvas.setLayoutY((mainPane.getHeight() - canvas.getHeight()) / 2);

        graphicsController.drawCanvas();
    }

    public void updatePane() {
        mainPane.setBackground(Background.fill(Color.LIGHTGRAY));
        if (!added) {
            added = true;
            mainPane.getChildren().add(graphicsController.getCanvas());
            mainPane.widthProperty().addListener((observable, oldValue, newValue) -> sizeChanged());
            mainPane.heightProperty().addListener((observable, oldValue, newValue) -> sizeChanged());
        }
        sizeChanged();
    }

    public GraphicsController getGraphicsController() {
        return graphicsController;
    }
}
