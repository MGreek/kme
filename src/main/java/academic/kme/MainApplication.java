package academic.kme;

import academic.kme.controllers.MainController;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import com.dansoftware.pdfdisplayer.PDFDisplayer;

import java.io.IOException;

public class MainApplication extends Application {
    private static SessionFactory factory;
    @Override
    public void start(Stage stage) throws IOException {
        String databasePath = "src/main/java/academic/kme/sandbox/sandbox.db";
        try {
            factory = new Configuration().configure("hibernate.cfg.xml").setProperty("hibernate.connection.url", "jdbc:sqlite:" + databasePath).buildSessionFactory();
        } catch (Throwable ex) {
            System.err.println("Failed to create factory object." + ex);
            throw new ExceptionInInitializerError(ex);
        }

        FXMLLoader fxmlLoader = new FXMLLoader(MainApplication.class.getResource("main-view.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 640, 480);
        stage.setTitle("KME");
        stage.setScene(scene);
        stage.show();
    }

    @Override
    public void stop() {
        if (factory != null) {
            factory.close();
        }
    }

    public static void main(String[] args) {
        launch();
    }
}