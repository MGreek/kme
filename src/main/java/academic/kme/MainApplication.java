package academic.kme;

import academic.kme.controller.MainController;
import academic.kme.model.Document.Document;
import jakarta.persistence.Query;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.stage.Stage;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import java.io.IOException;
import java.util.List;

public class MainApplication extends Application {
    private SessionFactory factory;
    private MainController controller;

    @Override
    public void start(Stage stage) throws IOException {
        String databasePath = "src/main/java/academic/kme/sandbox/sandbox.db";
        try {
            factory = new Configuration().configure("hibernate.cfg.xml").setProperty("hibernate.connection.url", "jdbc:sqlite:" + databasePath).buildSessionFactory();
        } catch (Throwable ex) {
            System.err.println("Failed to create factory object." + ex);
            throw new ExceptionInInitializerError(ex);
        }
        List<Document> documents;
        try (Session session = factory.openSession()) {
            session.beginTransaction();

            String hql = "FROM Document";
            Query query = session.createQuery(hql, Document.class);
            documents = query.getResultList();

            session.getTransaction().commit();
        }
        if (documents.isEmpty()) {
            documents.add(Document.DefaultDocument);
        }
        else if (documents.size() > 1) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Corrupt File");
            alert.setContentText("Cannot open file because it is corrupted.");
            alert.show();
            return;
        }

        FXMLLoader fxmlLoader = new FXMLLoader(MainApplication.class.getResource("main-view.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 640, 480);
        stage.setTitle("KME");
        stage.setScene(scene);
        stage.show();

        controller = fxmlLoader.getController();
        controller.getGraphicsController().setDocument(documents.get(0));
        controller.UpdateUpperAnchorPane();
    }

    @Override
    public void stop() {
        try (Session session = factory.openSession()) {
            session.beginTransaction();

            Document document = controller.getGraphicsController().getDocument();
            if (document != null) {
                if (session.get(Document.class, document.getId()) != null) {
                    session.merge(document);
                } else {
                    session.persist(document);
                }
            }

            session.getTransaction().commit();
        }

        factory.close();
    }

    public static void main(String[] args) {
        launch();
    }
}