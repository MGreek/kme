package academic.kme.controller;

import academic.kme.controller.CommandLine.CommandLineController;
import academic.kme.controller.Graphics.GraphicsController;
import academic.kme.model.Document.Document;
import javafx.fxml.FXML;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.Label;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.Background;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import lombok.Getter;

public class MainController {
    @Getter
    private Document document;

    public void setDocument(Document document) {
        this.document = document;
        graphicsController.setDocument(document);
        commandLineController.setDocument(document);
    }

    @FXML
    private Pane mainPane;
    @FXML
    private Label commandLine;

    private boolean added = false;

    @Getter
    private final GraphicsController graphicsController = new GraphicsController();
    @Getter
    private final CommandLineController commandLineController = new CommandLineController();

    private void updateCanvas() {
        Canvas canvas = graphicsController.getCanvas();

        graphicsController.resizeHeight(Math.min(mainPane.getWidth(), mainPane.getHeight()));

        canvas.setLayoutX((mainPane.getWidth() - canvas.getWidth()) / 2);
        canvas.setLayoutY((mainPane.getHeight() - canvas.getHeight()) / 2);

        graphicsController.drawCanvas();
    }

    public void onKeyPressed(KeyEvent keyEvent) {
    }

    public void updatePane() {
        mainPane.setBackground(Background.fill(Color.LIGHTGRAY));
        if (!added) {
            added = true;
            mainPane.getChildren().add(graphicsController.getCanvas());
            mainPane.widthProperty().addListener((observable, oldValue, newValue) -> updatePane());
            mainPane.heightProperty().addListener((observable, oldValue, newValue) -> updatePane());
        }
        updateCanvas();
    }
}
